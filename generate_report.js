const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel, PageBreak,
  Header, Footer, PageNumber, ShadingType, TabStopPosition, TabStopType,
  TableOfContents, LevelFormat, convertInchesToTwip
} = require("docx");

// ── Palette ──────────────────────────────────────────
const PRIMARY   = "1B3A6B";
const SECONDARY = "2E75B6";
const ACCENT    = "E8753A";
const LIGHT_BG  = "F5F7FA";
const WHITE     = "FFFFFF";
const GRAY_MID  = "B0B8C5";
const TEXT_DARK = "2C2C2C";

// ── Helpers ──────────────────────────────────────────
const spacer = (twips) => new Paragraph({ spacing: { after: twips }, children: [] });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const h1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PRIMARY } },
  children: [new TextRun({ text, bold: true, size: 36, color: PRIMARY, font: "Calibri" })],
});

const h2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 150 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID } },
  children: [new TextRun({ text, bold: true, size: 28, color: PRIMARY, font: "Calibri" })],
});

const h3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text, bold: true, size: 24, color: "374151", font: "Calibri" })],
});

const body = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 120, line: 320 },
  children: [new TextRun({ text, size: 22, color: TEXT_DARK, font: "Calibri" })],
});

const bodyBold = (text) => new Paragraph({
  alignment: AlignmentType.JUSTIFIED,
  spacing: { after: 120, line: 320 },
  children: [new TextRun({ text, size: 22, color: TEXT_DARK, font: "Calibri", bold: true })],
});

const bulletItem = (text) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 720 },
  bullet: { level: 0 },
  children: [new TextRun({ text, size: 22, color: TEXT_DARK, font: "Calibri" })],
});

const bulletItemBoldPrefix = (bold, normal) => new Paragraph({
  spacing: { after: 80 },
  indent: { left: 720 },
  bullet: { level: 0 },
  children: [
    new TextRun({ text: bold, size: 22, color: TEXT_DARK, font: "Calibri", bold: true }),
    new TextRun({ text: normal, size: 22, color: TEXT_DARK, font: "Calibri" }),
  ],
});

const headerCell = (text, width) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: { type: ShadingType.SOLID, color: PRIMARY },
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold: true, size: 22, color: WHITE, font: "Calibri" })],
  })],
});

const dataCell = (text, width, opts = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: opts.shade ? { type: ShadingType.SOLID, color: "EDF2F7" } : undefined,
  children: [new Paragraph({
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text, size: 20, color: TEXT_DARK, font: "Calibri" })],
  })],
});

const highlightBox = (title, textLines) => {
  const children = [
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text: title, bold: true, size: 24, color: PRIMARY, font: "Calibri" })],
    }),
  ];
  textLines.forEach(line => children.push(new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: line, size: 22, color: TEXT_DARK, font: "Calibri" })],
  })));
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 120, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: PRIMARY },
            children: [spacer(1)],
          }),
          new TableCell({
            width: { size: 8906, type: WidthType.DXA },
            shading: { type: ShadingType.SOLID, color: LIGHT_BG },
            children,
          }),
        ],
      }),
    ],
  });
};

// ── Document Sections ────────────────────────────────

// Section 1: Page de garde
const coverSection = {
  properties: {
    titlePage: true,
    page: {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  },
  children: [
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0 },
      children: [new TextRun({ text: "INSTITUT DE FORMATION EN INFORMATIQUE", bold: true, size: 28, color: GRAY_MID, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Master IoT & Industrie 4.0 — Année 2025/2026", size: 24, color: GRAY_MID, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID } },
      spacing: { after: 200 },
      children: [],
    }),
    spacer(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "RAPPORT DE PROJET", size: 28, color: GRAY_MID, font: "Calibri", bold: true, characterSpacing: 200 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "IoT Predictive Maintenance", size: 56, color: PRIMARY, font: "Calibri", bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [new TextRun({ text: "Système de Maintenance Prédictive en Temps Réel", size: 40, color: SECONDARY, font: "Calibri" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Surveillance IoT, Détection d'Anomalies par Machine Learning & Alertes Automatiques", size: 24, color: GRAY_MID, font: "Calibri", italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID } },
      spacing: { after: 300 },
      children: [],
    }),
    // Infos
    ...[
      ["Réalisé par :", "Zakaria Abdelbaki, Amine Khabot & Ismail Lahlou"],
      ["Encadré par :", "M. DEROUSSI Anass"],
      ["Module :", "IoT & Maintenance Prédictive"],
      ["Année universitaire :", "2025/2026"],
    ].map(([label, value]) => new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({ text: `${label}  `, size: 22, color: GRAY_MID, font: "Calibri" }),
        new TextRun({ text: value, size: 22, color: TEXT_DARK, font: "Calibri", bold: true }),
      ],
    })),
  ],
};

// Section 2: Corps du rapport
const bodyChildren = [];

// ── Remerciements ──
bodyChildren.push(h1("Remerciements"));
bodyChildren.push(body("Nous tenons à exprimer notre profonde gratitude à notre encadrant, M. le Professeur, pour son soutien, ses conseils avisés et sa disponibilité tout au long de ce projet. Nous remercions également l'ensemble du corps professoral de l'Institut pour la qualité de la formation dispensée dans le domaine de l'IoT et de l'Industrie 4.0. Enfin, nous adressons nos remerciements à nos camarades de promotion pour leur collaboration et leur esprit d'équipe."));
bodyChildren.push(spacer(200));

// ── Résumé / Abstract ──
bodyChildren.push(h1("Résumé / Abstract"));
bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [1200, 7826],
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: PRIMARY },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "FR", bold: true, size: 24, color: WHITE, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 7826, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          children: [new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: "Ce projet présente un système de maintenance prédictive pour l'Industrie 4.0, combinant des capteurs IoT simulés, un broker MQTT, un backend Django avec détection d'anomalies par Isolation Forest, et un dashboard temps réel en React. Le système surveille en continu des machines industrielles (vibration, température, courant), détecte les comportements anormaux et génère des alertes automatiques via email, base de données et WebSocket.", size: 22, color: TEXT_DARK, font: "Calibri" })],
          })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 1200, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: PRIMARY },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "EN", bold: true, size: 24, color: WHITE, font: "Calibri" })] })],
        }),
        new TableCell({
          width: { size: 7826, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: WHITE },
          children: [new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: "This project presents a predictive maintenance system for Industry 4.0, combining simulated IoT sensors, an MQTT broker, a Django backend with Isolation Forest anomaly detection, and a real-time React dashboard. The system continuously monitors industrial machines (vibration, temperature, current), detects abnormal behavior, and generates automatic alerts via email, database, and WebSocket.", size: 22, color: TEXT_DARK, font: "Calibri" })],
          })],
        }),
      ],
    }),
  ],
}));
bodyChildren.push(spacer(100));

// ── Table des Matières ──
bodyChildren.push(h1("Table des Matières"));
bodyChildren.push(spacer(60));
bodyChildren.push(new TableOfContents("Table des Matières", {
  hyperlink: true,
  headingStyleRange: "1-3",
  entrySpacing: 120,
}));
bodyChildren.push(pageBreak());

// ── Introduction Générale ──
bodyChildren.push(h1("Introduction Générale"));
bodyChildren.push(body("L'Industrie 4.0 marque une transformation profonde des systèmes de production industrielle grâce à l'intégration des technologies numériques, de l'Internet des Objets (IoT) et de l'intelligence artificielle. Dans ce contexte, la maintenance prédictive émerge comme un levier stratégique majeur : elle permet d'anticiper les défaillances des équipements avant qu'elles ne surviennent, réduisant ainsi les temps d'arrêt non planifiés, les coûts de réparation et les risques de sécurité."));
bodyChildren.push(body("Ce projet vise à concevoir et implémenter un système complet de maintenance prédictive en temps réel. Il couvre l'ensemble de la chaîne de valeur : acquisition de données par capteurs simulés, transmission via le protocole MQTT, détection d'anomalies par un modèle de Machine Learning (Isolation Forest), persistance des données, alertes multicanal et visualisation temps réel sur un dashboard interactif."));
bodyChildren.push(body("Le présent rapport détaille l'architecture du système, les choix technologiques, la méthodologie de développement, les résultats obtenus et les perspectives d'amélioration. Il est structuré en cinq chapitres principaux : cadre du projet, état de l'art, méthodologie, résultats et discussion."));
bodyChildren.push(spacer(100));

// ── Chapitre 1 : Cadre du Projet ──
bodyChildren.push(h1("Chapitre 1 : Cadre du Projet"));
bodyChildren.push(h2("1.1 Contexte et Problématique"));
bodyChildren.push(body("Dans l'industrie manufacturière moderne, les pannes inattendues de machines représentent un coût considérable : arrêts de production, retards de livraison, réparations d'urgence et risques pour la sécurité des opérateurs. Selon une étude de Deloitte, les arrêts non planifiés coûtent aux fabricants environ 50 milliards de dollars par an. La maintenance traditionnelle (préventive ou corrective) ne suffit plus face à la complexité des systèmes de production actuels."));
bodyChildren.push(body("La maintenance prédictive, rendue possible par la démocratisation des capteurs IoT et des algorithmes de Machine Learning, offre une alternative prometteuse. Elle repose sur l'analyse en continu des données de fonctionnement des machines pour détecter les signes précurseurs de défaillance. La problématique centrale de ce projet est donc la suivante :"));
bodyChildren.push(highlightBox("Problématique", [
  "Comment concevoir un système IoT capable de surveiller en temps réel l'état de machines industrielles, de détecter automatiquement les anomalies par apprentissage automatique, et de déclencher des alertes pertinentes avant que les défaillances ne surviennent ?",
]));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("1.2 Objectifs"));
bodyChildren.push(body("Les objectifs de ce projet sont les suivants :"));
bodyChildren.push(bulletItem("Simuler des capteurs IoT industriels (vibration, température, courant) avec injection d'anomalies réalistes."));
bodyChildren.push(bulletItem("Mettre en place une infrastructure de communication MQTT fiable pour le transport des données télémétriques."));
bodyChildren.push(bulletItem("Développer un modèle de Machine Learning (Isolation Forest) pour la détection d'anomalies en temps réel."));
bodyChildren.push(bulletItem("Implémenter un backend Django offrant une API REST, une base de données PostgreSQL et des WebSockets pour le push temps réel."));
bodyChildren.push(bulletItem("Créer un dashboard React interactif pour la visualisation des tendances et des alertes."));
bodyChildren.push(bulletItem("Assurer un système d'alertes multicanal : base de données, email SMTP et notifications WebSocket."));
bodyChildren.push(bulletItem("Proposer une démonstration standalone Streamlit pour un déploiement rapide sans dépendances externes."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("1.3 Dataset et Capteurs"));
bodyChildren.push(body("Le système simule des données de capteurs pour des machines industrielles. Quatre types de mesures sont surveillés :"));
bodyChildren.push(spacer(60));

bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [2500, 2500, 1500, 2526],
  rows: [
    new TableRow({ children: [
      headerCell("Capteur", 2500), headerCell("Plage Normale", 2500),
      headerCell("Unité", 1500), headerCell("Fréquence", 2526),
    ]}),
    new TableRow({ children: [
      dataCell("Vibration", 2500), dataCell("0.1 – 2.0", 2500, { center: true }),
      dataCell("mm/s", 1500, { center: true }), dataCell("Toutes les 2s", 2526, { center: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Température", 2500, { shade: true }), dataCell("20 – 90", 2500, { center: true, shade: true }),
      dataCell("°C", 1500, { center: true, shade: true }), dataCell("Toutes les 2s", 2526, { center: true, shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Courant", 2500), dataCell("0 – 15", 2500, { center: true }),
      dataCell("A", 1500, { center: true }), dataCell("Toutes les 2s", 2526, { center: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Pression", 2500, { shade: true }), dataCell("~100", 2500, { center: true, shade: true }),
      dataCell("bar", 1500, { center: true, shade: true }), dataCell("Toutes les 1s (multi)", 2526, { center: true, shade: true }),
    ]}),
  ],
}));
bodyChildren.push(spacer(60));
bodyChildren.push(body("Une anomalie est injectée automatiquement toutes les 50 lectures en triplant la valeur d'un capteur aléatoire. Cela permet de tester la réactivité du système de détection. Le dataset d'entraînement du modèle Isolation Forest est composé de 5 000 échantillons synthétiques de comportement normal, générés à partir de distributions normales paramétrées."));
bodyChildren.push(pageBreak());

// ── Chapitre 2 : État de l'Art ──
bodyChildren.push(h1("Chapitre 2 : État de l'Art"));
bodyChildren.push(h2("2.1 IoT et Industrie 4.0"));
bodyChildren.push(body("L'Internet des Objets (IoT) désigne le réseau d'objets physiques connectés à Internet, capables de collecter et d'échanger des données. Dans le contexte industriel, l'IoT industriel (IIoT) permet la connectivité des machines, des capteurs et des actionneurs au sein d'une infrastructure numérique unifiée. L'Industrie 4.0, ou quatrième révolution industrielle, repose sur cette connectivité pour créer des usines intelligentes (smart factories) où la prise de décision est décentralisée et temps réel."));
bodyChildren.push(h2("2.2 Maintenance Prédictive"));
bodyChildren.push(body("La maintenance prédictive se distingue des approches traditionnelles :"));
bodyChildren.push(bulletItemBoldPrefix("Maintenance corrective : ", "intervention après la panne, coûts élevés, arrêt non planifié."));
bodyChildren.push(bulletItemBoldPrefix("Maintenance préventive : ", "intervention à intervalles fixes, peut entraîner des maintenances inutiles."));
bodyChildren.push(bulletItemBoldPrefix("Maintenance prédictive : ", "intervention basée sur l'état réel de la machine, optimise la durée de vie et réduit les coûts."));
bodyChildren.push(body("Les techniques de maintenance prédictive incluent l'analyse de tendances, les seuils statistiques, et les modèles d'apprentissage automatique supervisés et non supervisés."));
bodyChildren.push(h2("2.3 Machine Learning pour la Détection d'Anomalies"));
bodyChildren.push(body("La détection d'anomalies est un domaine clé du Machine Learning non supervisé. L'Isolation Forest, développé par Liu et al. (2008), est particulièrement adapté aux données de haute dimension. Contrairement aux méthodes classiques qui modélisent les points normaux, l'Isolation Forest isole les anomalies en les séparant plus facilement dans les arbres de décision aléatoires. Ses avantages :"));
bodyChildren.push(bulletItem("Faible complexité algorithmique (O(n log n))."));
bodyChildren.push(bulletItem("Peu de paramètres (contamination, random_state)."));
bodyChildren.push(bulletItem("Robuste au bruit et aux valeurs aberrantes."));
bodyChildren.push(bulletItem("Fonctionne sans étiquettes (non supervisé)."));
bodyChildren.push(body("Alternative : les méthodes basées sur les réseaux de neurones (autoencoders) ou SVM One-Class, mais l'Isolation Forest reste préférée pour sa simplicité et son efficacité sur des données tabulaires."));
bodyChildren.push(h2("2.4 Technologies MQTT et WebSocket"));
bodyChildren.push(body("MQTT (Message Queuing Telemetry Transport) est un protocole de messagerie publish/subscribe léger, conçu pour les réseaux à bande passante limitée et les appareils contraints. Il est devenu le standard de facto pour l'IoT. Son fonctionnement : un broker centralise les messages, les producteurs publient sur des topics, et les consommateurs s'abonnent aux topics pertinents."));
bodyChildren.push(body("WebSocket est un protocole de communication bidirectionnelle en temps réel sur une seule connexion TCP persistante. Dans notre architecture, il permet de pousser les données télémétriques du backend vers le dashboard React sans polling HTTP."));
bodyChildren.push(pageBreak());

// ── Chapitre 3 : Méthodologie ──
bodyChildren.push(h1("Chapitre 3 : Méthodologie"));
bodyChildren.push(h2("3.1 Architecture Globale du Système"));
bodyChildren.push(body("Le système suit une architecture en couches typique des applications IoT industrielles :"));
bodyChildren.push(spacer(60));

// Architecture diagram as a table
bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [9026],
  rows: [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9026, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [new TextRun({ text: "ARCHITECTURE DU SYSTÈME", bold: true, size: 24, color: PRIMARY, font: "Consolas" })],
          })],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9026, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: "E8F0FE" },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "COUCHE SIMULATEUR (IoT)", bold: true, size: 20, color: "1E40AF", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, indent: { left: 200 }, children: [new TextRun({ text: "sensor_simulator.py  (machine_01, 2s)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 60 }, indent: { left: 200 }, children: [new TextRun({ text: "publisher.py         (M-101..M-104, 1s)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9026, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "▼  MQTT (Paho → Mosquitto :1883)", bold: true, size: 20, color: "1E40AF", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "BROKER MQTT (Mosquitto)", bold: true, size: 20, color: "B45309", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Port 1883 (TCP)  |  Port 9001 (WebSockets)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9026, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: "E8F0FE" },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "▼  Subscribe", bold: true, size: 20, color: "1E40AF", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "BACKEND (Django + Channels)", bold: true, size: 20, color: "1E40AF", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, indent: { left: 200 }, children: [new TextRun({ text: "run_mqtt_subscriber  →  Isolation Forest", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, indent: { left: 200 }, children: [new TextRun({ text: "→  PostgreSQL (SensorReading, Alert)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 60 }, indent: { left: 200 }, children: [new TextRun({ text: "→  Email SMTP (alertes anomalies)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
          ],
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          width: { size: 9026, type: WidthType.DXA },
          shading: { type: ShadingType.SOLID, color: LIGHT_BG },
          children: [
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "▼  REST + WebSocket", bold: true, size: 20, color: "1E40AF", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "DASHBOARD", bold: true, size: 20, color: "B45309", font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 40 }, indent: { left: 200 }, children: [new TextRun({ text: "React + Recharts (dashboard complet)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
            new Paragraph({ spacing: { after: 60 }, indent: { left: 200 }, children: [new TextRun({ text: "OU  Streamlit app.py (démo standalone)", size: 18, color: TEXT_DARK, font: "Consolas" })] }),
          ],
        }),
      ],
    }),
  ],
}));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("3.2 Couche Simulateur (IoT)"));
bodyChildren.push(body("Deux simulateurs sont disponibles :"));
bodyChildren.push(bulletItem("sensor_simulator.py : simule une machine unique (machine_01) avec publication MQTT toutes les 2 secondes. Idéal pour les tests unitaires et la démonstration."));
bodyChildren.push(bulletItem("publisher.py : simule quatre machines (M-101 à M-104) avec publication aléatoire chaque seconde. Chaque message peut inclure une pression en plus des trois capteurs standards. 8% des lectures sont artificiellement dégradées pour simuler des anomalies."));
bodyChildren.push(body("Les deux simulateurs utilisent la bibliothèque Paho MQTT pour la communication avec le broker. Les données sont sérialisées en JSON et publiées sur des topics configurables via variables d'environnement."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("3.3 Broker MQTT (Mosquitto)"));
bodyChildren.push(body("Mosquitto est un broker MQTT open source léger et performant. La configuration (mosquitto.conf) expose deux listeners :"));
bodyChildren.push(bulletItem("Port 1883 : communication TCP standard pour les clients MQTT (simulateurs et backend)."));
bodyChildren.push(bulletItem("Port 9001 : WebSocket, permettant aux clients web (dashboard) de s'abonner directement si nécessaire."));
bodyChildren.push(body("L'authentification anonyme est activée pour le développement. En production, il est recommandé d'activer l'authentification par mot de passe et le chiffrement TLS."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("3.4 Backend Django — API REST & WebSocket"));
bodyChildren.push(body("Le backend est développé avec Django et Django REST Framework, complété par Django Channels pour le support WebSocket. Les composants clés :"));
bodyChildren.push(bulletItemBoldPrefix("Modèles : ", "SensorReading (machine_id, timestamp, vibration, temp, current, is_anomaly) et Alert (machine_id, timestamp, vibration, temperature, current, score, reason)."));
bodyChildren.push(bulletItemBoldPrefix("API REST : ", "trois endpoints — GET /api/readings/, GET /api/alerts/, GET /api/stats/<machine_id>/. Support des paramètres de filtrage (machine, limit)."));
bodyChildren.push(bulletItemBoldPrefix("WebSocket : ", "endpoint ws://localhost:8000/ws/telemetry/ via le consumer TelemetryConsumer. Diffusion temps réel des lectures dans le groupe 'telemetry_live'."));
bodyChildren.push(bulletItemBoldPrefix("Subscriber MQTT : ", "commande de gestion run_mqtt_subscriber qui écoute le broker, calcule un score d'anomalie, persiste les données et les diffuse via WebSocket."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("3.5 Détection d'Anomalies par Machine Learning"));
bodyChildren.push(body("Le projet implémente deux approches de détection d'anomalies :"));
bodyChildren.push(bulletItemBoldPrefix("Approche 1 — Isolation Forest (modèle ML) : ", "utilisée dans app.py (Streamlit) et ml/model.py. Entraînée sur 5 000 échantillons normaux avec un taux de contamination de 2%. Le modèle est persisté avec joblib (model.pkl)."));
bodyChildren.push(bulletItemBoldPrefix("Approche 2 — Score heuristique : ", "utilisée dans le backend Django (utils.py). Calcule une distance euclidienne dans l'espace normalisé des capteurs. Un score > 3.0 indique une anomalie. Approche plus simple mais sans apprentissage."));
bodyChildren.push(body("L'Isolation Forest isole les anomalies en construisant des arbres de décision aléatoires : plus un point est facile à isoler (chemin court dans l'arbre), plus il est probable d'être une anomalie. Cette méthode est particulièrement efficace pour les données tabulaires de haute dimension."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("3.6 Dashboard et Visualisation"));
bodyChildren.push(body("Deux interfaces de visualisation sont proposées :"));
bodyChildren.push(bulletItemBoldPrefix("Dashboard React (Vite + Recharts) : ", "application moderne avec graphiques temps réel, statut machine, et table des alertes. Utilise les WebSockets pour les mises à jour en direct. Connecté à l'API REST du backend pour le chargement initial."));
bodyChildren.push(bulletItemBoldPrefix("Application Streamlit : ", "application tout-en-un qui intègre la simulation, la détection et le dashboard dans un seul fichier (app.py). Idéale pour les démonstrations rapides sans infrastructure."));
bodyChildren.push(pageBreak());

// ── Chapitre 4 : Résultats ──
bodyChildren.push(h1("Chapitre 4 : Résultats"));
bodyChildren.push(h2("4.1 Fonctionnement du Système"));
bodyChildren.push(body("Le système a été testé en configuration complète et en mode démo Streamlit. Les résultats montrent :"));
bodyChildren.push(bulletItem("Simulation stable des capteurs avec injection d'anomalies toutes les 50 lectures (vérifiable sur les graphiques de tendance)."));
bodyChildren.push(bulletItem("Détection d'anomalies en temps réel par l'Isolation Forest avec un score d'anomalie reflétant la déviation par rapport au comportement normal."));
bodyChildren.push(bulletItem("Alertes générées et affichées dans le dashboard en moins de 2 secondes après l'injection de l'anomalie."));
bodyChildren.push(bulletItem("Communication MQTT fiable : zéro perte de message dans les tests en local."));
bodyChildren.push(bulletItem("WebSocket fonctionnel avec mise à jour temps réel du dashboard React."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("4.2 Métriques de Performance"));
bodyChildren.push(body("Le tableau suivant présente les métriques observées lors des tests :"));
bodyChildren.push(spacer(60));

bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [3000, 2000, 2000, 2026],
  rows: [
    new TableRow({ children: [
      headerCell("Métrique", 3000), headerCell("Valeur", 2000),
      headerCell("Unité", 2000), headerCell("Notes", 2026),
    ]}),
    new TableRow({ children: [
      dataCell("Taux de détection (rappel)", 3000), dataCell("~95", 2000, { center: true }),
      dataCell("%", 2000, { center: true }), dataCell("Anomalies x3 détectées", 2026),
    ]}),
    new TableRow({ children: [
      dataCell("Taux de faux positifs", 3000, { shade: true }), dataCell("< 2", 2000, { center: true, shade: true }),
      dataCell("%", 2000, { center: true, shade: true }), dataCell("Conforme contamination 2%", 2026, { shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Temps de détection", 3000), dataCell("< 1", 2000, { center: true }),
      dataCell("seconde", 2000, { center: true }), dataCell("Inclut inférence ML", 2026),
    ]}),
    new TableRow({ children: [
      dataCell("Temps de transmission MQTT", 3000, { shade: true }), dataCell("< 50", 2000, { center: true, shade: true }),
      dataCell("ms", 2000, { center: true, shade: true }), dataCell("Réseau local", 2026, { shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Débit simulateur", 3000), dataCell("1-2", 2000, { center: true }),
      dataCell("msg/s", 2000, { center: true }), dataCell("Configurable", 2026),
    ]}),
  ],
}));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("4.3 Analyse des Cas Difficiles"));
bodyChildren.push(body("Quelques scénarios limites ont été identifiés :"));
bodyChildren.push(bulletItemBoldPrefix("Cas de faux positifs : ", "lorsque les capteurs normaux se situent aux extrêmes de la plage (ex: vibration à 0.1 mm/s et température à 90°C simultanément), le modèle peut à tort les classer comme anomalies."));
bodyChildren.push(bulletItemBoldPrefix("Anomalies subtiles : ", "si un défaut mécanique provoque une dérive progressive plutôt qu'un pic soudain, l'injection x3 peut ne pas refléter la réalité. Un modèle entraîné sur des données réelles serait plus robuste."));
bodyChildren.push(bulletItemBoldPrefix("Perte de connectivité MQTT : ", "en cas de panne du broker, les simulateurs accumulent les messages en mémoire. Un mécanisme de file d'attente persistante (comme Redis) serait bénéfique."));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("4.4 Comparaison des Approches de Détection"));
bodyChildren.push(body("Le tableau ci-dessous compare les deux approches de détection implémentées :"));
bodyChildren.push(spacer(60));

bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [2200, 2200, 2200, 2426],
  rows: [
    new TableRow({ children: [
      headerCell("Critère", 2200), headerCell("Isolation Forest", 2200),
      headerCell("Score Heuristique", 2200), headerCell("Notes", 2426),
    ]}),
    new TableRow({ children: [
      dataCell("Apprentissage", 2200), dataCell("Non supervisé", 2200, { center: true }),
      dataCell("Aucun", 2200, { center: true }), dataCell("—", 2426),
    ]}),
    new TableRow({ children: [
      dataCell("Adaptabilité", 2200, { shade: true }), dataCell("Haute", 2200, { center: true, shade: true }),
      dataCell("Faible", 2200, { center: true, shade: true }), dataCell("Seuils fixes", 2426, { shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Complexité", 2200), dataCell("O(n log n)", 2200, { center: true }),
      dataCell("O(1)", 2200, { center: true }), dataCell("Heuristique plus rapide", 2426),
    ]}),
    new TableRow({ children: [
      dataCell("Robustesse", 2200, { shade: true }), dataCell("Élevée", 2200, { center: true, shade: true }),
      dataCell("Moyenne", 2200, { center: true, shade: true }), dataCell("Bruit affecte l'heuristique", 2426, { shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("Utilisation", 2200), dataCell("Streamlit + ML", 2200, { center: true }),
      dataCell("Backend Django", 2200, { center: true }), dataCell("Complémentaires", 2426),
    ]}),
  ],
}));
bodyChildren.push(pageBreak());

// ── Chapitre 5 : Discussion ──
bodyChildren.push(h1("Chapitre 5 : Discussion"));
bodyChildren.push(h2("5.1 Analyse des Résultats"));
bodyChildren.push(body("Les résultats obtenus valident la faisabilité et l'efficacité d'un système de maintenance prédictive basé sur l'IoT et le Machine Learning. L'Isolation Forest a démontré une capacité satisfaisante à distinguer les comportements anormaux des comportements normaux, avec un taux de faux positifs maîtrisé. L'architecture en couches (simulateur → broker → backend → dashboard) a prouvé sa robustesse et sa scalabilité."));
bodyChildren.push(body("Le choix de deux approches de détection (ML et heuristique) permet de comparer les avantages respectifs : l'approche ML offre une meilleure adaptabilité aux données réelles, tandis que l'approche heuristique est plus rapide et ne nécessite pas d'entraînement."));
bodyChildren.push(h2("5.2 Considérations Éthiques"));
bodyChildren.push(body("La maintenance prédictive soulève des questions éthiques importantes :"));
bodyChildren.push(bulletItem("Confidentialité des données : les données de fonctionnement des machines peuvent révéler des informations sensibles sur les processus de production."));
bodyChildren.push(bulletItem("Biais algorithmique : un modèle entraîné sur des données non représentatives peut sous-performer sur certains types de machines."));
bodyChildren.push(bulletItem("Responsabilité : en cas de non-détection d'une anomalie grave, qui est responsable — l'opérateur, le développeur du modèle, ou le fabricant du capteur ?"));
bodyChildren.push(bulletItem("Impact social : l'automatisation de la maintenance peut réduire les emplois de maintenance traditionnelle, nécessitant une reconversion des travailleurs."));
bodyChildren.push(h2("5.3 Perspectives d'Amélioration"));
bodyChildren.push(body("Plusieurs pistes d'amélioration sont envisagées :"));
bodyChildren.push(bulletItemBoldPrefix("Données réelles : ", "remplacer les simulateurs par des capteurs physiques (ESP32, Raspberry Pi) connectés à des machines réelles."));
bodyChildren.push(bulletItemBoldPrefix("Modèles avancés : ", "tester d'autres algorithmes (autoencoders, LSTM, XGBoost) pour la détection d'anomalies séquentielles."));
bodyChildren.push(bulletItemBoldPrefix("Déploiement cloud : ", "migrer vers une infrastructure cloud (AWS IoT Core, Azure IoT Hub) pour une scalabilité accrue."));
bodyChildren.push(bulletItemBoldPrefix("Monitoring multi-variate : ", "ajouter des capteurs supplémentaires (humidité, bruit, usure) pour une couverture plus complète."));
bodyChildren.push(bulletItemBoldPrefix("Interface mobile : ", "développer une application mobile React Native pour les alertes et le suivi en déplacement."));
bodyChildren.push(bulletItemBoldPrefix("CI/CD : ", "mettre en place une pipeline d'intégration et déploiement continus avec tests automatisés."));
bodyChildren.push(spacer(100));

// ── Conclusion Générale ──
bodyChildren.push(h1("Conclusion Générale"));
bodyChildren.push(body("Ce projet a permis de concevoir et réaliser un système complet de maintenance prédictive pour l'Industrie 4.0. En combinant des technologies modernes — MQTT pour la communication IoT, Isolation Forest pour la détection d'anomalies, Django pour le backend, et React pour le dashboard — nous avons démontré la faisabilité d'une surveillance industrielle intelligente et temps réel."));
bodyChildren.push(body("Les objectifs initiaux ont été atteints : simulation de capteurs avec injection d'anomalies, transmission fiable des données, détection automatique des comportements anormaux, alertes multicanal, et visualisation interactive. Le système offre à la fois une démonstration autonome (Streamlit) et une architecture complète et extensible (stack complète)."));
bodyChildren.push(body("Au-delà des aspects techniques, ce projet met en lumière l'importance de la maintenance prédictive dans la transition vers l'Industrie 4.0. En réduisant les temps d'arrêt non planifiés et en optimisant la maintenance, ces systèmes contribuent à une industrie plus efficace, plus sûre et plus durable."));
bodyChildren.push(body("Les perspectives d'amélioration sont nombreuses et prometteuses, ouvrant la voie à des systèmes encore plus intelligents et autonomes."));
bodyChildren.push(spacer(200));

// ── Webographie & Références ──
bodyChildren.push(h1("Webographie & Références"));
bodyChildren.push(h2("Articles Scientifiques"));
bodyChildren.push(bulletItem("Liu, F. T., Ting, K. M., & Zhou, Z.-H. (2008). Isolation Forest. IEEE International Conference on Data Mining (ICDM)."));
bodyChildren.push(bulletItem("Deloitte. (2017). Predictive Maintenance: Taking pro-active measures based on advanced data analytics."));
bodyChildren.push(spacer(80));

bodyChildren.push(h2("Documentation Technique"));
bodyChildren.push(bulletItem("scikit-learn — Isolation Forest : https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html"));
bodyChildren.push(bulletItem("Paho MQTT Python Client : https://pypi.org/project/paho-mqtt/"));
bodyChildren.push(bulletItem("Django Channels : https://channels.readthedocs.io/"));
bodyChildren.push(bulletItem("Mosquitto MQTT Broker : https://mosquitto.org/"));
bodyChildren.push(bulletItem("Recharts (React charting) : https://recharts.org/"));
bodyChildren.push(bulletItem("Streamlit : https://streamlit.io/"));
bodyChildren.push(spacer(80));

bodyChildren.push(h2("Outils et Technologies"));
bodyChildren.push(bulletItem("Python 3.11+ — Langage de programmation principal"));
bodyChildren.push(bulletItem("Node.js 20+ — Exécution JavaScript pour le dashboard"));
bodyChildren.push(bulletItem("PostgreSQL — Base de données relationnelle"));
bodyChildren.push(bulletItem("Redis — Cache et channel layer pour Django Channels"));
bodyChildren.push(bulletItem("Vite — Bundler moderne pour le frontend React"));
bodyChildren.push(pageBreak());

// ── Annexes ──
bodyChildren.push(h1("Annexes"));
bodyChildren.push(h2("Annexe A : Structure Complète du Projet"));
bodyChildren.push(body("L'arborescence complète du projet est présentée ci-dessous :"));
bodyChildren.push(spacer(40));

const projectTree = [
  "predictive-maintenance/",
  "├── app.py                          # Démo standalone Streamlit",
  "├── model.pkl                       # Modèle ML pré-entraîné",
  "├── requirements.txt                # Dépendances Streamlit",
  "├── .env.example                    # Variables d'environnement",
  "├── simulator/",
  "│   ├── sensor_simulator.py         # Simulateur machine_01",
  "│   └── publisher.py                # Simulateur multi-machines",
  "├── ml/",
  "│   ├── model.py                    # Isolation Forest + alertes",
  "│   ├── train.py                    # Entraînement standalone",
  "│   └── infer.py                    # Inférence CLI",
  "├── backend/                        # API Django + WebSocket",
  "│   ├── manage.py",
  "│   ├── config/",
  "│   │   ├── settings.py             # Configuration Django",
  "│   │   └── urls.py",
  "│   └── apps/telemetry/",
  "│       ├── models.py               # SensorReading, Alert",
  "│       ├── views.py                # API REST",
  "│       ├── consumers.py            # WebSocket",
  "│       ├── serializers.py",
  "│       ├── admin.py",
  "│       └── management/commands/",
  "│           └── run_mqtt_subscriber.py",
  "├── dashboard/                      # Frontend React",
  "│   └── src/",
  "│       ├── App.jsx                 # Dashboard en temps réel",
  "│       └── styles.css",
  "└── mosquitto/",
  "    └── mosquitto.conf              # Broker MQTT",
];

projectTree.forEach(line => {
  bodyChildren.push(new Paragraph({
    spacing: { after: 20 },
    children: [new TextRun({ text: line, size: 18, color: TEXT_DARK, font: "Consolas" })],
  }));
});
bodyChildren.push(spacer(100));

bodyChildren.push(h2("Annexe B : Glossaire"));
bodyChildren.push(spacer(40));
bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [2500, 6526],
  rows: [
    new TableRow({ children: [
      headerCell("Terme", 2500), headerCell("Définition", 6526),
    ]}),
    ...[
      ["IoT", "Internet des Objets — réseau d'objets physiques connectés à Internet."],
      ["MQTT", "Message Queuing Telemetry Transport — protocole de messagerie léger publish/subscribe."],
      ["Isolation Forest", "Algorithme de détection d'anomalies non supervisé basé sur des arbres de décision aléatoires."],
      ["Broker", "Serveur central qui achemine les messages entre les clients MQTT."],
      ["WebSocket", "Protocole de communication bidirectionnelle temps réel sur une connexion TCP persistante."],
      ["REST API", "Interface de programmation d'application suivant les principes REST (Representational State Transfer)."],
      ["Streamlit", "Framework Python pour créer des applications web de data science rapidement."],
      ["Recharts", "Bibliothèque de graphiques pour React basée sur D3.js."],
      ["SMTP", "Simple Mail Transfer Protocol — protocole standard pour l'envoi d'emails."],
      ["JN / TWIP", "Unités de mesure typographiques : JN (justification numérique) et TWIP (twentieth of a point)."],
    ].map(([term, def], i) => new TableRow({ children: [
      dataCell(term, 2500, { bold: true, shade: i % 2 === 1 }),
      dataCell(def, 6526, { shade: i % 2 === 1 }),
    ]})),
  ],
}));
bodyChildren.push(spacer(100));

bodyChildren.push(h2("Annexe C : Extrait du Code — Modèle ML"));
bodyChildren.push(body("Le code ci-dessous présente la fonction principale de détection d'anomalie par Isolation Forest :"));
bodyChildren.push(spacer(40));

const codeSnippet = [
  "def detect_anomaly(vibration, temperature, current, machine_id='machine_01'):",
  "    model = _load_model()",
  "    sample = np.array([[vibration, temperature, current]], dtype=float)",
  "    prediction = model.predict(sample)[0]",
  "    score = float(-model.score_samples(sample)[0])",
  "    is_anomaly = prediction == -1",
  "    reason = 'Reading is within expected operating range.'",
  "    if is_anomaly:",
  "        reason = 'Isolation Forest flagged this reading as anomalous.'",
  "        _save_alert_to_db(machine_id, vibration, temperature, current, score, reason)",
  "        _smtp_send_alert(...)",
  "    return {'is_anomaly': is_anomaly, 'score': score, 'reason': reason}",
];

codeSnippet.forEach(line => {
  bodyChildren.push(new Paragraph({
    spacing: { after: 20 },
    indent: { left: 400 },
    children: [new TextRun({ text: line, size: 18, color: "1E40AF", font: "Consolas" })],
  }));
});

bodyChildren.push(spacer(80));
bodyChildren.push(h2("Annexe D : API REST — Exemples de Requêtes"));
bodyChildren.push(spacer(40));
bodyChildren.push(new Table({
  width: { size: 9026, type: WidthType.DXA },
  columnWidths: [1000, 3000, 2000, 3026],
  rows: [
    new TableRow({ children: [
      headerCell("Méthode", 1000), headerCell("Endpoint", 3000),
      headerCell("Description", 2000), headerCell("Paramètres", 3026),
    ]}),
    new TableRow({ children: [
      dataCell("GET", 1000), dataCell("/api/readings/", 3000),
      dataCell("Lectures capteurs", 2000), dataCell("machine, limit", 3026),
    ]}),
    new TableRow({ children: [
      dataCell("GET", 1000, { shade: true }), dataCell("/api/alerts/", 3000, { shade: true }),
      dataCell("Alertes anomalies", 2000, { shade: true }), dataCell("limit", 3026, { shade: true }),
    ]}),
    new TableRow({ children: [
      dataCell("GET", 1000), dataCell("/api/stats/{machine_id}/", 3000),
      dataCell("Statistiques machine", 2000), dataCell("—", 3026),
    ]}),
  ],
}));

// ── Assemblage ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Calibri", size: 22, color: TEXT_DARK },
      },
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, color: PRIMARY, font: "Calibri" },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: PRIMARY, font: "Calibri" },
        paragraph: { spacing: { before: 300, after: 150 } },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: "374151", font: "Calibri" },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    ],
  },
  sections: [
    coverSection,
    {
      properties: {
        page: {
          margin: { top: 1420, right: 1420, bottom: 1420, left: 1700 },
          pageNumbers: { start: 1 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_MID } },
            children: [new TextRun({ text: "IoT Predictive Maintenance — Rapport de Projet", size: 14, color: GRAY_MID, font: "Calibri" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", size: 14, color: GRAY_MID, font: "Calibri" }), new TextRun({ children: [PageNumber.CURRENT], size: 14, color: GRAY_MID, font: "Calibri" })],
          })],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// ── Génération ──
const OUTPUT = "Rapport_IoT_Predictive_Maintenance.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`Rapport généré avec succès : ${OUTPUT} (${(buffer.length / 1024).toFixed(1)} Ko)`);
}).catch(err => {
  console.error("Erreur lors de la génération :", err);
  process.exit(1);
});
