// Totally arbitrary, just for variety
const colors = ['#1890ff', '#f56a00', '#87d068', '#722ed1', '#eb2f96'];

export function randomColor(seed: string): string {
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

