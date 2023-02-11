export const toCapital = (word: string) => {
  if (!word) return word;
  return word[0].toUpperCase() + word.substring(1);
};
