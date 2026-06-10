// Envia a imagem carregada pelo formulário para um repositório GitHub usando a API Octokit.


const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'RodolfoL';
const GITHUB_REPO = 'rp_moda_policial_pwa';
const GITHUB_BRANCH = 'main';
const TARGET_FOLDER = 'img/produtos/';

function sanitizeFileName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'produto';
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Falha ao ler o arquivo como base64.'));
        return;
      }
      const base64 = result.split(',', 2)[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error || new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

async function loadOctokit() {
  const { Octokit } = await import('https://cdn.jsdelivr.net/npm/@octokit/rest/dist-web/index.js');
  return new Octokit({ auth: GITHUB_TOKEN });
}

async function getExistingFileSha(octokit, path) {
  try {
    const response = await octokit.rest.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
      ref: GITHUB_BRANCH,
    });
    const data = response.data;
    return Array.isArray(data) ? data[0]?.sha : data.sha;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function uploadImageToGithub(file, productName) {
  const extension = file.type === 'image/png'
    ? 'png'
    : file.type === 'image/jpeg'
      ? 'jpg'
      : file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${sanitizeFileName(productName)}.${extension}`;
  const filePath = `${TARGET_FOLDER}/${fileName}`;
  const content = await readFileAsBase64(file);
  const octokit = await loadOctokit();
  const sha = await getExistingFileSha(octokit, filePath);

  const params = {
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    path: filePath,
    message: `Upload do produto ${productName}`,
    content,
    branch: GITHUB_BRANCH,
  };

  if (sha) {
    params.sha = sha;
  }

  await octokit.rest.repos.createOrUpdateFileContents(params);
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
}

function isValidImageFile(file) {
  return file && ['image/png', 'image/jpeg'].includes(file.type);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('productForm');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const fileInput = document.getElementById('productImage');
    const productNameInput = document.getElementById('productName');
    const file = fileInput?.files?.[0];
    const productName = productNameInput?.value?.trim();

    if (!file || !productName) {
      alert('Selecione a imagem e informe o nome do produto.');
      return;
    }

    if (!isValidImageFile(file)) {
      alert('Selecione uma imagem PNG ou JPEG.');
      return;
    }

    try {
      const imageUrl = await uploadImageToGithub(file, productName);
      alert(`Imagem enviada para o GitHub:\n${imageUrl}`);
      form.reset();
      form.classList.remove('was-validated');
    } catch (error) {
      console.error(error);
      alert('Falha ao enviar a imagem para o GitHub. Verifique o token, permissões e o nome do repositório.');
    }
  });
});

