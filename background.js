// Structure du projet:
//
// mon-extension/
// ├── manifest.json
// ├── background.js
// ├── content-scripts/
// │   └── navigation.js
// ├── popup/
// │   ├── config.html
// │   └── config.js
// └── icons/
//     ├── icon-48.png
//     └── icon-96.png

// manifest.json
{
  "manifest_version": 2,
  "name": "Navigation Automatisée Aléatoire",
  "version": "1.0",
  "description": "Extension qui automatise la navigation aléatoire sur le web",
  "icons": {
    "48": "icons/icon-48.png",
    "96": "icons/icon-96.png"
  },
  "permissions": [
    "tabs",
    "activeTab",
    "webNavigation",
    "storage",
    "<all_urls>"
  ],
  "background": {
    "scripts": ["background.js"]
  },
  "content_scripts": [
    {
      "matches": ["*://*.google.com/*", "*://*.google.fr/*", "*://*.bing.com/*", "*://search.yahoo.com/*", "*://duckduckgo.com/*"],
      "js": ["content-scripts/navigation.js"]
    }
  ],
  "browser_action": {
    "default_icon": {
      "48": "icons/icon-48.png",
      "96": "icons/icon-96.png"
    },
    "default_title": "Navigation Automatisée Aléatoire",
    "default_popup": "popup/config.html"
  }
}

// background.js
// Définir des valeurs par défaut lors de la première exécution
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get(["searchEngines", "targetSite", "keywords"]).then(data => {
    if (!data.searchEngines) {
      browser.storage.local.set({
        searchEngines: [
          { url: "https://www.google.com", enabled: true },
          { url: "https://www.bing.com", enabled: true },
          { url: "https://search.yahoo.com", enabled: true },
          { url: "https://duckduckgo.com", enabled: true }
        ],
        targetSite: "example.com",
        keywords: ["example site", "example information"]
      });
    }
  });
});

// Fonction pour choisir aléatoirement un moteur de recherche parmi ceux activés
function getRandomSearchEngine() {
  return browser.storage.local.get("searchEngines").then(data => {
    const enabledEngines = data.searchEngines.filter(engine => engine.enabled);
    if (enabledEngines.length === 0) {
      // Si aucun moteur n'est activé, utiliser Google par défaut
      return "https://www.google.com";
    }
    const randomIndex = Math.floor(Math.random() * enabledEngines.length);
    return enabledEngines[randomIndex].url;
  });
}

// Fonction pour choisir aléatoirement un mot-clé
function getRandomKeyword() {
  return browser.storage.local.get("keywords").then(data => {
    if (!data.keywords || data.keywords.length === 0) {
      return "";
    }
    const randomIndex = Math.floor(Math.random() * data.keywords.length);
    return data.keywords[randomIndex];
  });
}

// Démarrer la navigation
function startNavigation() {
  // Récupérer le site cible
  browser.storage.local.get("targetSite").then(siteData => {
    const targetSite = siteData.targetSite;
    
    // Récupérer un mot-clé aléatoire
    getRandomKeyword().then(keyword => {
      // Construire la requête de recherche
      let searchQuery = targetSite;
      if (keyword) {
        searchQuery += " " + keyword;
      }
      
      // Stocker la requête pour le script de contenu
      browser.storage.local.set({ 
        currentSearchQuery: searchQuery,
        currentTargetSite: targetSite
      });
      
      // Choisir un moteur de recherche aléatoire
      getRandomSearchEngine().then(searchEngine => {
        // Ouvrir le moteur de recherche choisi
        browser.tabs.create({
          url: searchEngine
        }).then(tab => {
          // Stocker l'ID de l'onglet pour le suivre
          browser.storage.local.set({ navigationTabId: tab.id });
        });
      });
    });
  });
}

// Écouter les changements d'état des onglets
browser.webNavigation.onCompleted.addListener((details) => {
  browser.storage.local.get("navigationTabId").then(data => {
    if (details.tabId === data.navigationTabId) {
      // Si c'est notre onglet de navigation et que la page est chargée
      browser.tabs.sendMessage(details.tabId, {
        action: "navigationStarted",
        url: details.url
      });
    }
  });
});