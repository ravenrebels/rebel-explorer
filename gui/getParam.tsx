export function getParam(name: string) {
  const searchParams = new URLSearchParams(document.location.search);
  return searchParams.get(name);
}
