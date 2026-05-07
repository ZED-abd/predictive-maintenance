# Template de Rapport — Guide de Construction

Basé sur la structure du rapport *Détection de Commentaires Toxiques sur YouTube*.

## 1. Prérequis

- Node.js
- Bibliothèque `docx` : `npm install docx`

## 2. Palette de Couleurs (minimale)

```js
const PRIMARY   = "1B3A6B";   // bleu marine foncé
const SECONDARY = "2E75B6";   // bleu vif
const ACCENT    = "E8753A";   // orange (usage rare)
const LIGHT_BG  = "F5F7FA";   // gris-bleu très clair
const WHITE     = "FFFFFF";
const GRAY_MID  = "B0B8C5";   // gris pour éléments discrets
const TEXT_DARK = "2C2C2C";   // texte principal (noir adouci)
```

## 3. Helpers (fonctions réutilisables)

| Helper | Usage | Rendu |
|--------|-------|-------|
| `h1("Texte")` | Titre de chapitre | Marine, gras, bordure fine dessous |
| `h2("Texte")` | Sous-titre | Marine, gras, bordure grise discrète |
| `h3("Texte")` | Sous-sous-titre | Gris foncé, gras, sans bordure |
| `body("texte")` | Paragraphe justifié | Taille 22, interligne 320 |
| `bulletItem("texte")` | Liste à puces | Avec retrait et espacement |
| `spacer(200)` | Espace vertical | Ligne vide avec `after` en DXA |
| `pageBreak()` | Saut de page | |
| `headerCell("txt", largeur)` | Cellule en-tête tableau | Fond clair, texte marine |
| `dataCell("txt", largeur)` | Cellule donnée tableau | Blanc, alternance `shade:true` |
| `highlightBox("Titre", "texte")` | Encadré mise en valeur | Barre latérale marine + fond clair |

## 4. Structure du Document

Le document est découpé en **sections** (`sections: [...]`).

### Section 1 — Page de Garde

- `properties.page.margin: { top: 0, right: 0, bottom: 0, left: 0 }` (pleine page)
- Contenu :
  1. `spacer(400)` — espace haut
  2. Nom de l'établissement (centré, gris, gras)
  3. Filière / Année (centré, gris)
  4. Ligne de séparation fine
  5. "RAPPORT DE PROJET" (petit, espacé, gris)
  6. Titre principal (40pt, marine, gras)
  7. Sous-titre (40pt, bleu)
  8. Description secondaire (italique)
  9. Ligne de séparation fine
  10. Infos : Réalisé par, Encadré par, Module, Année (centré, label en gris, valeur en foncé)

### Section 2 — Corps du Rapport

- `properties.page.margin: { top: 1300, right: 1400, bottom: 1200, left: 1400 }`
- **Header** : texte discret + bordure fine (14pt, gris)
- **Footer** : "Page N" (14pt, gris, centré)
- Contenu libre avec `h1()`, `h2()`, `body()`, `bulletItem()`, etc.

## 5. Ordre des Sections (recommandé)

1. **Page de garde**
2. **Remerciements**
3. **Résumé / Abstract** (tableau bilingue)
4. **Table des Matières** (`TableOfContents`)
5. **Introduction Générale**
6. **Chapitre 1 : Cadre du Projet**
   - 1.1 Contexte et Problématique
   - 1.2 Objectifs
   - 1.3 Dataset (tableau caractéristiques)
7. **Chapitre 2 : État de l'Art**
   - 2.1–2.4 (sections techniques)
8. **Chapitre 3 : Méthodologie**
   - Diagramme d'architecture
   - Sous-parties A–E
9. **Chapitre 4 : Résultats**
   - Tableaux de métriques
   - Diagramme comparatif
   - Analyse des cas difficiles
10. **Chapitre 5 : Discussion**
    - Résultats, éthique, perspectives
11. **Conclusion Générale**
12. **Webographie & Références**
13. **Annexes** (structure projet, glossaire, code)

## 6. Exemple de Tableau

```js
new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [2000, 2000, 2000, 2426],
  rows: [
    new TableRow({ children: [
      headerCell("Titre 1", 2000),
      headerCell("Titre 2", 2000),
      headerCell("Titre 3", 2000),
      headerCell("Titre 4", 2426),
    ]}),
    new TableRow({ children: [
      dataCell("Valeur 1", 2000),
      dataCell("Valeur 2", 2000),
      dataCell("Valeur 3", 2000),
      dataCell("Valeur 4", 2426, { center: true }),
    ]}),
    // ... plus de lignes
  ]
})
```

## 7. Génération

```js
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("mon_rapport.docx", buffer);
  console.log("Done");
});
```

## 8. fichiers source

- `const {.js` → script de génération
- `TEMPLATE_RAPPORT.md` → ce guide
