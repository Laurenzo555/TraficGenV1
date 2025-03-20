// popup/config.js
document.addEventListener('DOMContentLoaded', () => {
  // Charger la configuration actuelle
  loadConfig();
  
  // Ajouter les gestionnaires d'événements
  document.getElementById('addSearchEngine').addEventListener('click', addSearchEngine);
  document.getElementById('addKeyword').addEventListener('click', addKeyword);
  document.getElementById('saveConfig').addEventListener('click', saveConfig);
  document.getElementById('startNavigation').addEventListener('click', startNavigation);
});

// Charger la configuration depuis le stockage
function loadConfig() {
  browser.storage.local.get(['searchEngines', 'targetSite', 'keywords']).then(data => {
    // Remplir le site cible
    if (data.targetSite) {
      document.getElementById('targetSite').value = data.targetSite;
    }
    
    // Remplir les moteurs de recherche
    const searchEnginesContainer = document.getElementById('searchEnginesContainer');
    searchEnginesContainer.innerHTML = '';
    
    if (data.searchEngines && data.searchEngines.length > 0) {
      data.searchEngines.forEach((engine, index) => {
        const div = document.createElement('div');
        div.className = 'engine-checkbox';
        div.innerHTML = `
          <label>
            <input type="checkbox" class="engine-check" data-index="${index}" ${engine.enabled ? 'checked' : ''}>
            ${engine.url}
            <span class="remove-keyword" data-engine-index="${index}"> &#10006;</span>
          </label>
        `;
        searchEnginesContainer.appendChild(div);
      });
      
      // Ajouter les gestionnaires pour supprimer les moteurs
      document.querySelectorAll('.remove-keyword[data-engine-index]').forEach(span => {
        span.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-engine-index'));
          removeSearchEngine(index);
        });
      });
    }
    
    // Remplir les mots-clés
    const keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = '';
    
    if (data.keywords && data.keywords.length > 0) {
      data.keywords.forEach((keyword, index) => {
        const div = document.createElement('div');
        div.className = 'keyword-item';
        div.innerHTML = `
          <span>${keyword}</span>
          <span class="remove-keyword" data-keyword-index="${index}"> &#10006;</span>
        `;
        keywordList.appendChild(div);
      });
      
      // Ajouter les gestionnaires pour supprimer les mots-clés
      document.querySelectorAll('.remove-keyword[data-keyword-index]').forEach(span => {
        span.addEventListener('click', (e) => {
          const index = parseInt(e.target.getAttribute('data-keyword-index'));
          removeKeyword(index);
        });
      });
    }
  });
}

// Ajouter un nouveau moteur de recherche
function addSearchEngine() {
  const customSearchEngineInput = document.getElementById('customSearchEngine');
  const url = customSearchEngineInput.value.trim();
  
  if (!url) {
    alert('Veuillez entrer une URL valide.');
    return;
  }
  
  // Vérifier que l'URL est valide
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    alert('Veuillez entrer une URL valide commençant par http:// ou https://');
    return;
  }
  
  browser.storage.local.get('searchEngines').then(data => {
    let searchEngines = data.searchEngines || [];
    
    // Vérifier si ce moteur existe déjà
    if (searchEngines.some(engine => engine.url === url)) {
      alert('Ce moteur de recherche existe déjà dans la liste.');
      return;
    }
    
    // Ajouter le nouveau moteur
    searchEngines.push({
      url: url,
      enabled: true
    });
    
    // Enregistrer et recharger
    browser.storage.local.set({ searchEngines }).then(() => {
      customSearchEngineInput.value = '';
      loadConfig();
    });
  });
}

// Supprimer un moteur de recherche
function removeSearchEngine(index) {
  browser.storage.local.get('searchEngines').then(data => {
    let searchEngines = data.searchEngines || [];
    
    if (index >= 0 && index < searchEngines.length) {
      searchEngines.splice(index, 1);
      
      // Enregistrer et recharger
      browser.storage.local.set({ searchEngines }).then(loadConfig);
    }
  });
}

// Ajouter un nouveau mot-clé
function addKeyword() {
  const newKeywordInput = document.getElementById('newKeyword');
  const keyword = newKeywordInput.value.trim();
  
  if (!keyword) {
    alert('Veuillez entrer un mot-clé.');
    return;
  }
  
  browser.storage.local.get('keywords').then(data => {
    let keywords = data.keywords || [];
    
    // Vérifier si ce mot-clé existe déjà
    if (keywords.includes(keyword)) {
      alert('Ce mot-clé existe déjà dans la liste.');
      return;
    }
    
    // Ajouter le nouveau mot-clé
    keywords.push(keyword);
    
    // Enregistrer et recharger
    browser.storage.local.set({ keywords }).then(() => {
      newKeywordInput.value = '';
      loadConfig();
    });
  });
}

// Supprimer un mot-clé
function removeKeyword(index) {
  browser.storage.local.get('keywords').then(data => {
    let keywords = data.keywords || [];
    
    if (index >= 0 && index < keywords.length) {
      keywords.splice(index, 1);
      
      // Enregistrer et recharger
      browser.storage.local.set({ keywords }).then(loadConfig);
    }
  });
}

// Enregistrer la configuration
function saveConfig() {
  // Récupérer le site cible
  const targetSite = document.getElementById('targetSite').value.trim();
  
  // Récupérer l'état des moteurs de recherche
  const engineCheckboxes = document.querySelectorAll('.engine-check');
  
  browser.storage.local.get('searchEngines').then(data => {
    let searchEngines = data.searchEngines || [];
    
    // Mettre à jour l'état activé/désactivé de chaque moteur
    engineCheckboxes.forEach(checkbox => {
      const index = parseInt(checkbox.getAttribute('data-index'));
      if (index >= 0 && index < searchEngines.length) {
        searchEngines[index].enabled = checkbox.checked;
      }
    });
    
    // Enregistrer la configuration
    browser.storage.local.set({
      searchEngines,
      targetSite
    }).then(() => {
      alert('Configuration enregistrée !');
    });
  });
}

// Lancer la navigation
function startNavigation() {
  // Enregistrer d'abord la configuration
  saveConfig();
  
  // Lancer la navigation via le script d'arrière-plan
  browser.runtime.getBackgroundPage().then(bg => {
    bg.startNavigation();
    window.close(); // Fermer le popup
  });
}