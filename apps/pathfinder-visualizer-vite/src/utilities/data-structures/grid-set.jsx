export class GridSet {
  constructor(coords_set = []) {
    this.set = new Set();
    this.addMultiple(coords_set);
  }
  add = (coords) => {
    this.set.add(JSON.stringify(coords));
    return this;
  };
  addMultiple = (coords_set) => {
    let successes = [];
    for (let coords of coords_set) {
      let size = this.size();
      this.add(coords);
      if (this.size() > size) successes.push(coords);
    }
    return successes;
  };
  has = (coords) => this.set.has(JSON.stringify(coords));
  toArray = () => [...this.set].map((str) => JSON.parse(str));
  at = (index) => (index < this.size() ? JSON.parse([...this.set][index]) : null);
  popRandom = () => {
    let coords = this.at(Math.floor(Math.random() * this.set.size));
    if (coords) this.set.delete(JSON.stringify(coords));
    return coords;
  };
  delete = (coords) => this.set.delete(JSON.stringify(coords));
  size = () => this.set.size;
  clone = () => {
    let copy = [...this.set];
    copy = copy.map((coord_str) => JSON.parse(coord_str));
    return new GridSet(copy);
  };
}
