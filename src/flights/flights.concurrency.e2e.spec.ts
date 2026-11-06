// Pending: these need a real Postgres test database. SQLite supports neither
// the pessimistic_write locks nor the ::int cast in the correlative query, and
// the unit specs only check, with mocks, that the locks are requested.
describe('Flights concurrency (Postgres)', () => {
  describe('FlightsUpsertService.create', () => {
    it.todo(
      'gives concurrent creations for the same airline consecutive codes with no duplicates',
    );

    it.todo(
      'returns 409 Conflict when another airline already holds the code with the same prefix',
    );
  });

  describe('FlightsReserveService.reserveSeat', () => {
    it.todo(
      'lets only one of two concurrent reservations of the same seat succeed',
    );

    it.todo(
      'keeps both concurrent reservations of different seats on the same flight',
    );
  });

  describe('FlightsUpsertService schedule and status updates', () => {
    it.todo(
      'does not overwrite a seat reserved while the status or schedule is updated',
    );
  });
});
