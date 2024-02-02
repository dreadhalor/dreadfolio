export class GridUnionFind {
  constructor(coords_set = []) {
    this.count = 0; // Number of disconnected components
    this.setMap = new Map(); // Keep track of connected components
    // Initialize the data structure such that all elements have themselves as parents
    this.addMultiple(coords_set);
  }

  union(coords_a, coords_b) {
    let a_id = this.setMap.get(JSON.stringify(coords_a)),
      b_id = this.setMap.get(JSON.stringify(coords_b));
    let min = Math.min(a_id, b_id);
    let max = Math.max(a_id, b_id);
    if (min !== max) {
      for (let key of this.setMap.keys()) {
        if (this.setMap.get(key) === max) this.setMap.set(key, min);
      }
    }
    return true;
  }
  nextFreeID = () => {
    let ids = this.setIDs();
    let candidate_id = 0;
    while (ids.has(candidate_id)) candidate_id++;
    return candidate_id;
  };

  // Add new node
  add = (coords) => {
    if (this.find(coords) !== undefined) return false;
    this.setMap.set(JSON.stringify(coords), this.nextFreeID());
    this.count++;
    return true;
  };
  addMultiple = (coords_set) => {
    for (let coords of coords_set) this.add(coords);
  };

  remove = (coords) => {
    if (this.find(coords) !== undefined) {
      this.setMap.delete(JSON.stringify(coords));
      this.count--;
    }
  };
  removeMultiple = (coords_set) => {
    for (let coords of coords_set) this.remove(coords);
  };

  // Find the set ID
  find = (coords) => this.setMap.get(JSON.stringify(coords));

  // Checks connectivity of the 2 nodes
  connected = (coords_a, coords_b) =>
    this.setMap.get(JSON.stringify(coords_a)) === this.setMap.get(JSON.stringify(coords_b));

  sets() {
    //very non-optimal but it works
    let reverseMap = new Map();
    for (let [coords_str, id] of this.setMap.entries()) {
      if (!reverseMap.has(id)) reverseMap.set(id, []);
      reverseMap.get(id).push(JSON.parse(coords_str));
    }
    return reverseMap.values();
  }
  setIDs() {
    return new Set(this.setMap.values());
  }
  transferData(params) {
    let { setMap, count } = params ?? {};
    if (!setMap) return { setMap: this.setMap, count: this.count };
    this.setMap = setMap;
    this.count = count;
    return this;
  }
}
