const CONFIG = {
    // ============== CONTENITORE GIOCO & TERRENO ==============
    CONTENITORE_LARGHEZZA: 900,
    CONTENITORE_ALTEZZA: 400,
    TERRENO_SPESSORE: 3,
    TERRENO_OFFSET_DAL_FONDO_PX: 9,

    // ============== GLOBALE ==============
    VELOCITA_GIOCO_INIZIALE: 3.5,
    VELOCITA_INCREMENTO_BASE: 0.4, // Incremento per ogni "anno" superato
    VELOCITA_INCREMENTO_ANNO_OLTRE_25: 0.2,
    VELOCITA_INCREMENTO_ANNO_OLTRE_30: 0.1,
    RITARDO_RIAVVIO_MS: 1000, // tempo di attesa prima di poter riavviare dopo un game over

    INTERVALLO_CREAZIONE_OSTACOLO_MIN_MS: 2500,
    INTERVALLO_CREAZIONE_OSTACOLO_RANDOM_MS: 3000,
    INTERVALLO_CREAZIONE_NUVOLA_MIN_MS: 3000,
    INTERVALLO_CREAZIONE_NUVOLA_RANDOM_MS: 3000,

    // ============== PLAYER ==============
    PLAYER_LARGHEZZA: 100,
    PLAYER_ALTEZZA: 100,
    PLAYER_COLLIDER_LARGHEZZA: 35,
    PLAYER_COLLIDER_ALTEZZA: 85,
    PLAYER_COLLIDER_OFFSET_X: 30,
    PLAYER_COLLIDER_OFFSET_Y: 0,
    PLAYER_POS_SINISTRA: 50,    // Posizione X fissa dal bordo sinistro
    PLAYER_POS_FONDO: 0,        // Posizione Y dal bordo inferiore del contenitore
    PLAYER_ALTEZZA_SALTO_RELATIVA: 145,
    VELOCITA_ANIMAZIONE_CORSA_MS: 90, // Millisecondi per frame della corsa
    FATTORE_RALLENTAMENTO_ANIM_SALTO: 3,

    // ============== FISICA DEL SALTO  ==============
    GRAVITY: 0.9, 
    INITIAL_JUMP_VELOCITY: 17,

    // ============== OSTACOLI ==============
    OSTACOLO_LARGHEZZA: 60,
    OSTACOLO_ALTEZZA: 70,
    OSTACOLO_COLLIDER_LARGHEZZA: 40,
    OSTACOLO_COLLIDER_ALTEZZA: 60,
    OSTACOLO_COLLIDER_OFFSET_X: 5,
    OSTACOLO_COLLIDER_OFFSET_Y: 5,
    OSTACOLO_POS_FONDO: 0,
    OSTACOLO_START_X: 1200,

    // ============== ELEMENTI SCENARIO ==============
    NUVOLA_LARGHEZZA: 90,
    NUVOLA_ALTEZZA: 60,
    NUVOLA_START_X: 1200,
    NUVOLA_TOP_MIN: 100,
    NUVOLA_TOP_MAX: 180,

    // ============== PUNTEGGIO E PROGRESSIONE ==============
    PUNTEGGIO_PADDING: 5,
    ANNO_INIZIALE: 18,
    ANNO_MASSIMO: 40,
    INTERVALLO_AUMENTO_ANNO_MS: 5000,

    // ============== SPRITES ==============
    SPRITE_PLAYER_BASE_PATH: 'sprite/',
    SPRITE_PLAYER_PREFISSO: '', 
    SPRITE_PLAYER_ESTENSIONE: '.svg',
    SPRITE_PLAYER_CONTEGGIO: 6, // Numero di frame per l'animazione di corsa
    
    SPRITE_MURO_PATH: 'sprite/muro.svg',
    SPRITE_SASSO_PATH: 'sprite/sasso.svg',
    SPRITE_NUVOLA_PATH: 'sprite/nuvola.svg',
};
