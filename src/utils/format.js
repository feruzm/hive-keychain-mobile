export const withCommas = (nb, decimals = 3) =>
  parseFloat(nb)
    .toFixed(decimals)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const toHP = (vests, props) =>
  (parseFloat(vests) * parseFloat(props.total_vesting_fund_steem)) /
  parseFloat(props.total_vesting_shares);

export const chunkArray = (myArray, chunk_size) => {
  const arrayLength = myArray.length;
  let tempArray = [];

  for (let index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
};

export const objectMap = (object, mapFn) => {
  return Object.keys(object).reduce(function (result, key) {
    result[key] = mapFn(object[key]);
    return result;
  }, {});
};

export const signedNumber = (nb) => (nb > 0 ? `+${nb}` : `${nb}`);
