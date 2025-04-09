export default function getMonacoLanguageFromId(id: number): string {
  switch (id) {
    case 63:
      return 'javascript';
    case 71:
      return 'python';
    case 54:
      return 'cpp';
    case 62:
      return 'java';
    case 60:
      return 'go';
    case 73:
      return 'rust';
    case 68:
      return 'php';
    case 83:
      return 'swift';
    default:
      return 'plaintext';
  }
}
