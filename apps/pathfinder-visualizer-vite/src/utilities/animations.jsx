import { getDimensions } from './maze-structures';

export const finishAnimation = (grid) => {
  let animation_queue = [];
  let [rows, cols] = getDimensions(grid);
  for (let i = 0; i < rows; i++) {
    let finish_animation = [];
    for (let j = 0; j < cols; j++) {
      let tile = grid[i][j];
      finish_animation.push(() => tile.animate(2));
    }
    animation_queue.push(() => {
      for (let animation of finish_animation) animation();
    });
  }
  return animation_queue;
};
export const clearScanAnimationGenerator = (grid) => (path_set) => {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[0].length; j++) {
      let tile = grid[i][j];
      if (tile.val === 5 || tile.val === 6 || tile.val === 7) {
        if (tile.val === 6 || tile.val === 7) {
          tile.setVal(() => 0);
        } else if (path_set.has([i, j])) tile.setVal(() => 0);
        else tile.setVal(() => 3);
      }
    }
  }
};

//I can't believe this actually works
export const animationGenerator =
  (grid, animation) =>
  ([r, c], params) => {
    let tile = grid[r][c];
    animation(tile, params);
  };

export const kruskalsAnimations = (grid) => {
  return {
    animation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 0);
      tile.animate(1);
    }),
  };
};

export const primsAnimations = (grid) => {
  return {
    connectAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 0);
      tile.animate(1);
    }),
    frontierAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 7);
      // tile.animate(1);
    }),
  };
};

export const huntAndKillAnimations = (grid) => {
  return {
    traverseAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 6);
      tile.animate(1);
    }),
    scanAnimation: animationGenerator(grid, (tile) => tile.setVal(() => 5)),
    clearScanAnimation: clearScanAnimationGenerator(grid),
  };
};

export const recursiveBacktrackingAnimations = (grid) => {
  return {
    traverseAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 4);
      tile.animate(1);
    }),
    backtrackAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 0);
      tile.animate(1);
    }),
  };
};

export const ellersAnimations = (grid) => {
  return {
    connectAnimation: animationGenerator(grid, (tile) => {
      tile.setVal(() => 0);
      tile.animate(1);
    }),
    // popAnimation: animationGenerator(grid, (tile) => tile.animate(2)),
    displayValAnimation: animationGenerator(grid, (tile, displayVal) =>
      tile.setDisplayVal(displayVal)
    ),
  };
};

export const recursiveDivisionAnimations = (grid) => {
  return {
    animation: animationGenerator(grid, (tile) => {
      //FIX THIS, USING A NULL CHECK IS A COP-OUT
      if (tile) tile.setVal(() => 3);
    }),
  };
};
