const categories = [
  { name: 'cars', f_weight: 1 },
  { name: 'fitness', f_weight: 1 },
  { name: 'wallpaper', f_weight: 2 },
  { name: 'technology', f_weight: 2 },
  { name: 'food', f_weight: 1 },
  { name: 'nature', f_weight: 2 },
  { name: 'art', f_weight: 3 },
  { name: 'travel', f_weight: 3 },
  { name: 'quotes', f_weight: 1 },
  { name: 'cats', f_weight: 2 },
  { name: 'dogs', f_weight: 2 },
];

//generate a random category name from the categories array using the f_weight
const randomCategory = () => {
  let sum = categories.reduce((acc, curr) => acc + curr.f_weight, 0);
  let normalized_categories = categories.map((category) => {
    return {
      ...category,
      f_weight: category.f_weight / sum,
    };
  });
  sum = 0;
  const random = Math.random();
  for (let i = 0; i < normalized_categories.length; i++) {
    sum += normalized_categories[i].f_weight;
    if (random < sum) {
      return normalized_categories[i].name;
    }
  }
};

// //run the randomCategory function 100000 times and store the results in an array
// const category_results = [];
// for (let i = 0; i < 100000; i++) {
//   category_results.push(randomCategory());
// }
// //count the number of times each category appears in the array, but order them based on the original 'category' array
// const category_counts = category_results.reduce((acc, curr) => {
//   if (acc[curr]) {
//     acc[curr]++;
//   } else {
//     acc[curr] = 1;
//   }
//   return acc;
// }, {});

// //sort the category_counts object by the order the categories appear in the original 'category' array
// const sorted_category_counts = Object.keys(category_counts)
//   .sort((a, b) => {
//     return (
//       categories.findIndex((category) => category.name === a) -
//       categories.findIndex((category) => category.name === b)
//     );
//   })
//   .reduce((acc, curr) => {
//     acc[curr] = category_counts[curr];
//     return acc;
//   }, {});

console.log(randomCategory());
