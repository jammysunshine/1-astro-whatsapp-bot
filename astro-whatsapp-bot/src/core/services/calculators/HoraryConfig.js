
class HoraryConfig {
    getHouseMeaning(houseNumber) {
        const meanings = {
            1: 'Self, appearance, personality',
            2: 'Wealth, possessions, values',
            3: 'Communication, siblings, short trips',
            4: 'Home, family, mother, roots',
            5: 'Creativity, children, romance',
            6: 'Health, work, service, enemies',
            7: 'Partnership, marriage, open enemies',
            8: 'Transformation, death, inheritance',
            9: 'Philosophy, long journeys, higher education',
            10: 'Career, reputation, father',
            11: 'Friends, hopes, gains',
            12: 'Secrets, sorrows, self-undoing',
        };
        return meanings[houseNumber] || 'Unknown House';
    }

    getAllPlanetaryRulers() {
        return ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    }

    getPlanetaryHour(hourIndex) {
        const rulers = this.getAllPlanetaryRulers();
        return rulers[hourIndex % rulers.length];
    }

    getQuestionCategory(questionType) {
        const categories = {
            love: { rulers: ['venus'] },
            career: { rulers: ['saturn', 'sun'] },
            health: { rulers: ['mars', 'sun'] },
            money: { rulers: ['jupiter', 'venus'] },
            travel: { rulers: ['moon', 'mercury'] },
            family: { rulers: ['moon', 'sun'] },
            legal: { rulers: ['jupiter', 'saturn'] },
            spiritual: { rulers: ['jupiter', 'sun'] },
            general: { rulers: ['moon', 'sun'] },
        };
        return categories[questionType] || categories['general'];
    }

    getPlanetaryRuler(planet) {
        const rulers = {
            sun: { name: 'Sun' },
            moon: { name: 'Moon' },
            mars: { name: 'Mars' },
            mercury: { name: 'Mercury' },
            jupiter: { name: 'Jupiter' },
            venus: { name: 'Venus' },
            saturn: { name: 'Saturn' },
        };
        return rulers[planet] || { name: 'Unknown' };
    }

    getZodiacSign(longitude) {
        const signs = [
            'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
            'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
        ];
        return signs[Math.floor(longitude / 30)];
    }

    getHouseNumber(longitude, ascendant) {
        const relativeLongitude = (longitude - ascendant + 360) % 360;
        return Math.floor(relativeLongitude / 30) + 1;
    }

    getAscendantSymbol(degree) {
        return 'ASC';
    }

    getDayOfYear(day, month) {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    getSignRuler(sign) {
        const rulers = {
            'Aries': 'mars',
            'Taurus': 'venus',
            'Gemini': 'mercury',
            'Cancer': 'moon',
            'Leo': 'sun',
            'Virgo': 'mercury',
            'Libra': 'venus',
            'Scorpio': 'mars',
            'Sagittarius': 'jupiter',
            'Capricorn': 'saturn',
            'Aquarius': 'saturn',
            'Pisces': 'jupiter',
        };
        return rulers[sign] || 'sun';
    }
}

module.exports = { HoraryConfig };
