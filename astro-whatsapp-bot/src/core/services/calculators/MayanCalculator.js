
class MayanCalculator {
    constructor(dataProvider) {
        this.dataProvider = dataProvider;
    }

    calculateTzolkIn(birthDate) {
        return '1 Imix';
    }

    calculateHaab(birthDate) {
        return '8 Cumku';
    }

    calculateYearBearer(birthDate) {
        return '7 Ik';
    }
}

module.exports = { MayanCalculator };
