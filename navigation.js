// content-scripts/navigation.js
// Réception des messages du script d'arrière-plan
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "navigationStarted") {
    console.log("Navigation démarrée sur : " + message.url);
    
    // Attendre que la page soit complètement chargée
    setTimeout(() => {
      browser.storage.local.get(["currentSearchQuery", "currentTargetSite"]).then(data => {
        const searchQuery = data.currentSearchQuery || "";
        const targetSite = data.currentTargetSite || "";
        
        // Déterminer sur quel moteur de recherche nous sommes
        if (message.url.includes("google.com") || message.url.includes("google.fr")) {
          searchOnGoogle(searchQuery, targetSite);
        } else if (message.url.includes("bing.com")) {
          searchOnBing(searchQuery, targetSite);
        } else if (message.url.includes("yahoo.com")) {
          searchOnYahoo(searchQuery, targetSite);
        } else if (message.url.includes("duckduckgo.com")) {
          searchOnDuckDuckGo(searchQuery, targetSite);
        } else {
          // Tenter une approche générique pour d'autres moteurs
          searchGeneric(searchQuery, targetSite);
        }
      });
    }, 1500);
  }
});

// Fonction pour rechercher sur Google
function searchOnGoogle(searchQuery, targetSite) {
  const searchInput = document.querySelector('input[name="q"]');
  if (searchInput) {
    searchInput.value = searchQuery;
    searchInput.form.submit();
    // Attendre les résultats et cliquer sur le lien
    setTimeout(() => clickOnTargetSite(targetSite), 2500);
  }
}

// Fonction pour rechercher sur Bing
function searchOnBing(searchQuery, targetSite) {
  const searchInput = document.querySelector('#sb_form_q');
  if (searchInput) {
    searchInput.value = searchQuery;
    document.querySelector('#sb_form').submit();
    // Attendre les résultats et cliquer sur le lien
    setTimeout(() => clickOnTargetSite(targetSite), 2500);
  }
}

// Fonction pour rechercher sur Yahoo
function searchOnYahoo(searchQuery, targetSite) {
  const searchInput = document.querySelector('#yschsp');
  if (searchInput) {
    searchInput.value = searchQuery;
    document.querySelector('#sf').submit();
    // Attendre les résultats et cliquer sur le lien
    setTimeout(() => clickOnTargetSite(targetSite), 2500);
  }
}

// Fonction pour rechercher sur DuckDuckGo
function searchOnDuckDuckGo(searchQuery, targetSite) {
  const searchInput = document.querySelector('#search_form_input_homepage, #search_form_input');
  if (searchInput) {
    searchInput.value = searchQuery;
    document.querySelector('#search_form_homepage, #search_form').submit();
    // Attendre les résultats et cliquer sur le lien
    setTimeout(() => clickOnTargetSite(targetSite), 2500);
  }
}

// Approche générique pour d'autres moteurs de recherche
function searchGeneric(searchQuery, targetSite) {
  // Chercher des éléments d'entrée de recherche communs
  const searchInputs = document.querySelectorAll('input[type="search"], input[name="q"], input[name="query"], input[name="search"]');
  
  if (searchInputs.length > 0) {
    // Utiliser le premier champ de recherche trouvé
    const searchInput = searchInputs[0];
    searchInput.value = searchQuery;
    
    // Chercher le formulaire parent
    let form = searchInput.form;
    if (form) {
      form.submit();
      // Attendre les résultats et cliquer sur le lien
      setTimeout(() => clickOnTargetSite(targetSite), 2500);
    }
  }
}

// Fonction pour cliquer sur le lien du site cible dans les résultats de recherche
function clickOnTargetSite(targetSite) {
  // Chercher les liens dans les résultats de recherche
  const links = Array.from(document.querySelectorAll('a'));
  
  // Filtrer pour trouver les liens qui contiennent le site cible
  const targetLinks = links.filter(link => {
    return link.href.includes(targetSite);
  });
  
  if (targetLinks.length > 0) {
    console.log("Lien trouvé, navigation vers le site cible...");
    targetLinks[0].click();
  } else {
    console.log("Aucun lien correspondant à " + targetSite + " n'a été trouvé.");
  }
}