class PlanetaryPositions {
  constructor(positions) {
    this.positions = positions;
    this.timestamp = new Date();
  }

  getPlanetPosition(planetName) {
    return this.positions.find(planet =>
      planet.name.toLowerCase() === planetName.toLowerCase()
    );
  }

  getSign(planetName) {
    const planet = this.getPlanetPosition(planetName);
    return planet ? planet.sign : null;
  }

  getHouse(planetName) {
    const planet = this.getPlanetPosition(planetName);
    return planet ? planet.house : null;
  }

  toJSON() {
    return {
      positions: this.positions,
      timestamp: this.timestamp,
      totalPlanets: this.positions.length
    };
  }
}

module.exports = PlanetaryPositions;
