describe('sample test 101', () => {
    xit('Works as expected', () => {
        const age = 100;
        expect(1).toEqual(1);
        expect(age).toEqual(100);
    });

    it.skip('handle ranges just fine', () => {
        const age = 200;
        expect(age).toBeGreaterThan(100);
    });

    xit('makes a list of dog names', () => {
        const dogs = ['snickers', 'hugo'];
        expect(dogs).toEqual(dogs);
        expect(dogs).toContain('snickers');
        expect(dogs).toContain('snickers');
    });
});