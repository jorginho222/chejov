import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Not, Repository } from 'typeorm';
import { Airplane } from './entities/airplane.entity';
import { Flight } from '../flights/entities/flight.entity';
import { CreateAirplaneDto } from './dto/create.airplane.dto';
import { S3Service } from '../shared/s3/s3.service';
import {
  isForeignKeyViolation,
  isUniqueViolation,
} from '../shared/common/database.errors';

@Injectable()
export class AirplanesService {
  private readonly logger = new Logger(AirplanesService.name);

  constructor(
    @InjectRepository(Airplane)
    private readonly airplaneRepository: Repository<Airplane>,
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    private s3Service: S3Service,
  ) {}

  async findAll(): Promise<Airplane[]> {
    return await this.airplaneRepository.find({
      order: { brand: 'ASC', model: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Airplane> {
    const airplane = await this.airplaneRepository.findOneBy({ id });
    if (!airplane) {
      throw new NotFoundException(`Airplane ${id} not found`);
    }

    return airplane;
  }

  // Airplanes reach airlines through flights, so an airplane any flight uses
  // stays, whatever the flight's status, to keep the flight's history intact
  async remove(id: string): Promise<void> {
    const airplane = await this.findOne(id);
    await this.assertNoFlightUses(id);

    try {
      await this.airplaneRepository.delete(id);
    } catch (error) {
      // A flight may be created between the check and the delete
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          `Airplane ${id} is used by flights and cannot be deleted`,
        );
      }
      throw error;
    }

    await this.deleteImageQuietly(airplane);
  }

  async search(criteria: FindManyOptions<Airplane>) {
    return await this.airplaneRepository.find(criteria);
  }

  // Upserts by id, so saving an airplane with its own model is allowed
  async upsert(airplaneDto: CreateAirplaneDto): Promise<Airplane> {
    await this.assertModelIsFree(airplaneDto.model, airplaneDto.id);

    const airplane = this.airplaneRepository.create(airplaneDto);
    airplane.validate();

    try {
      return await this.airplaneRepository.save(airplane);
    } catch (error) {
      // Another request may take the model between the check and the save
      if (isUniqueViolation(error)) {
        throw this.modelTaken(airplaneDto.model);
      }
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, airplaneId: string) {
    const airplane = await this.airplaneRepository.findOneByOrFail({
      id: airplaneId,
    });
    const key = `${file.fieldname}_${Date.now()}`;

    airplane.imageUrl = await this.s3Service.uploadFile(file, key);
    await this.airplaneRepository.save(airplane);
  }

  async deleteFile(airplaneId: string) {
    const airplane = await this.airplaneRepository.findOneByOrFail({
      id: airplaneId,
    });
    if (!airplane.imageUrl) {
      throw new BadRequestException('No image to delete');
    }
    await this.s3Service.deleteFile(this.imageKey(airplane));

    airplane.imageUrl = '';
    await this.airplaneRepository.save(airplane);
  }

  private async assertModelIsFree(model: string, id: string): Promise<void> {
    const taken = await this.airplaneRepository.existsBy({
      model,
      id: Not(id),
    });
    if (taken) {
      throw this.modelTaken(model);
    }
  }

  private modelTaken(model: string): ConflictException {
    return new ConflictException(
      `An airplane with model ${model} already exists`,
    );
  }

  private async assertNoFlightUses(id: string): Promise<void> {
    const flights = await this.flightRepository.find({
      select: { id: true, airline: { name: true } },
      where: { airplane: { id } },
      relations: { airline: true },
    });
    if (flights.length === 0) {
      return;
    }

    const airlines = [
      ...new Set(
        flights
          .map((flight) => flight.airline?.name)
          .filter((name) => typeof name === 'string'),
      ),
    ].sort();
    const usedBy = airlines.length > 0 ? ` of ${airlines.join(', ')}` : '';

    throw new ConflictException(
      `Airplane ${id} is used by ${flights.length} flight(s)${usedBy} and cannot be deleted`,
    );
  }

  // The airplane is already gone, so a failure here only leaves an orphan file
  private async deleteImageQuietly(airplane: Airplane): Promise<void> {
    if (!airplane.imageUrl) {
      return;
    }

    try {
      await this.s3Service.deleteFile(this.imageKey(airplane));
    } catch (error) {
      this.logger.warn(
        `Airplane ${airplane.id} was deleted, but not its image ${airplane.imageUrl}`,
        error,
      );
    }
  }

  private imageKey(airplane: Airplane): string {
    return airplane.imageUrl.split('/').pop() ?? '';
  }
}
