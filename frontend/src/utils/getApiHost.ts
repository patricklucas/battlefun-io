export function getApiHost(protocol = "http") {
  const { location } = window;
  return `${protocol}://${location.hostname}:8000`;
}
