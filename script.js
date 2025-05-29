class GiocoRunner {
    constructor() {
        this.config = CONFIG;

        this.inizializzaElementi();
        this.precaricaImmaginiStatiche();
        this.inizializzaVariabili();
        this.inizializzaEventi();
        this.lastFrameTime = 0;
    }

    inizializzaElementi() {
        this.gameAreaWrapper = document.getElementById('gameAreaWrapper');
        this.contenitore = document.getElementById('contenitoreGioco');
        this.player = document.getElementById('player');
        this.lineaTerreno = document.getElementById('lineaTerreno');
        this.elementoPunteggio = document.getElementById('punteggio');
        this.messaggioInizio = document.getElementById('messaggioInizio');
        this.messaggioGameOver = document.getElementById('messaggioGameOver');
        this.displayAnno = document.getElementById('displayAnno');
        this.testoAnno = document.getElementById('testoAnno');
        this.messaggioRiavvio = document.getElementById('messaggioRiavvio');

        document.documentElement.style.setProperty('--ground-line-visual-thickness', `${this.config.TERRENO_SPESSORE}px`);
        document.documentElement.style.setProperty('--ground-line-visual-bottom-offset', `${this.config.TERRENO_OFFSET_DAL_FONDO_PX}px`);

        const rootStyle = getComputedStyle(document.documentElement);

        this.contenitore.style.width = `${this.config.CONTENITORE_LARGHEZZA}px`;
        this.contenitore.style.height = `${this.config.CONTENITORE_ALTEZZA}px`;
        this.contenitore.style.transformOrigin = 'center center';
        
        this.player.style.width = `${this.config.PLAYER_LARGHEZZA}px`;
        this.player.style.height = `${this.config.PLAYER_ALTEZZA}px`;
        this.player.style.left = `${this.config.PLAYER_POS_SINISTRA}px`;
        this.player.style.bottom = `${this.config.PLAYER_POS_FONDO}px`;
        this.player.style.backgroundImage = `url('${this.config.SPRITE_PLAYER_BASE_PATH}${this.config.SPRITE_PLAYER_PREFISSO}0${this.config.SPRITE_PLAYER_ESTENSIONE}')`;

        const colliderPlayer = this._creaColliderElement({
            className: 'collider-player',
            larghezza: this.config.PLAYER_COLLIDER_LARGHEZZA,
            altezza: this.config.PLAYER_COLLIDER_ALTEZZA,
            offsetX: this.config.PLAYER_COLLIDER_OFFSET_X,
            offsetY: this.config.PLAYER_COLLIDER_OFFSET_Y
        });
        this.player.appendChild(colliderPlayer);

        this.velocitaAnimazioneCorsa = this.config.VELOCITA_ANIMAZIONE_CORSA_MS;
    }

    _creaColliderElement(configCollider) {
        const colliderEl = document.createElement('div');
        colliderEl.className = `collider ${configCollider.className}`;
        colliderEl.style.width = `${configCollider.larghezza}px`;
        colliderEl.style.height = `${configCollider.altezza}px`;
        colliderEl.style.left = `${configCollider.offsetX}px`;
        colliderEl.style.top = `${configCollider.offsetY}px`;
        return colliderEl;
    }

    precaricaImmaginiStatiche() {
        this.immagineMuro = new Image();
        this.immagineMuro.src = this.config.SPRITE_MURO_PATH;

        this.immagineNuvola = new Image();
        this.immagineNuvola.src = this.config.SPRITE_NUVOLA_PATH;
        
        this.immagineSasso = new Image();
        this.immagineSasso.src = this.config.SPRITE_SASSO_PATH;
    }

    inizializzaVariabili() {
        this.stato = 'inizio'; 
        this.punteggio = 0;
        this.velocitaGioco = this.config.VELOCITA_GIOCO_INIZIALE;
        this.ostacoli = [];
        this.nuvole = [];
        this.tempoUltimoOstacolo = 0;
        this.tempoUltimaNuvola = 0;
        this.animationId = null;
        this.tempoGameOver = 0;
        this.pausa = false;

        this.annoCorrente = this.config.ANNO_INIZIALE;
        this.frameCorsaCorrente = 0;
        this.tempoUltimoAumentoAnno = 0;
        this.tempoUltimoFrameCorsa = 0;
        this.tempoUltimoFrameCorsaAccumulato = 0;
        this.spriteCorsa = [];
        this.immaginiSpriteCorsa = [];
        this.puntiPerOstacolo = 10;
        this.tempoUltimoPuntoSecondo = 0;

        for (let i = 0; i < this.config.SPRITE_PLAYER_CONTEGGIO; i++) {
            const pathSprite = `${this.config.SPRITE_PLAYER_BASE_PATH}${this.config.SPRITE_PLAYER_PREFISSO}${i}${this.config.SPRITE_PLAYER_ESTENSIONE}`;
            this.spriteCorsa.push(pathSprite);
            
            const img = new Image();
            img.src = pathSprite;
            this.immaginiSpriteCorsa.push(img);
        }
    }

    inizializzaEventi() {
        document.addEventListener('keydown', (evento) => {
            if (evento.code === 'Space') {
                evento.preventDefault();
                this.gestisciSpazio();
            } else if (evento.code === 'Escape') {
                this.togglePausa();
            }
        });

        document.addEventListener('touchstart', (evento) => {
            evento.preventDefault();
            this.gestisciSpazio();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });
        this.handleResize();
    }

    handleResize() {
        if (!this.gameAreaWrapper || !this.contenitore) return;

        const wrapperWidth = this.gameAreaWrapper.offsetWidth;
        const wrapperHeight = this.gameAreaWrapper.offsetHeight;

        const gameWidth = this.config.CONTENITORE_LARGHEZZA;
        const gameHeight = this.config.CONTENITORE_ALTEZZA;

        const scaleX = wrapperWidth / gameWidth;
        const scaleY = wrapperHeight / gameHeight;
        
        let scale = Math.min(1, scaleX, scaleY);

        this.contenitore.style.transform = `scale(${scale})`;
        this.contenitore.style.marginLeft = '0px';
        this.contenitore.style.marginTop = '0px';
    }

    togglePausa() {
        if (this.stato === 'giocando') {
            this.pausa = !this.pausa;
            
            if (this.pausa) {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            } else {
                this.lastFrameTime = performance.now();
                this.animationId = requestAnimationFrame((timestamp) => this.cicloGioco(timestamp));
            }
        }
    }

    gestisciSpazio() {
        switch (this.stato) {
            case 'inizio':
                this.iniziaGioco();
                break;
            case 'giocando':
                if (!this.pausa) {
                    this.salta();
                }
                break;
            case 'gameOver':
                if (performance.now() - this.tempoGameOver > this.config.RITARDO_RIAVVIO_MS) {
                    this.riavviaGioco();
                }
                break;
        }
    }

    iniziaGioco() {
        this.stato = 'giocando';
        this.messaggioInizio.style.display = 'none';
        this.messaggioGameOver.style.display = 'none';
        this.messaggioRiavvio.style.display = 'none';
        this.displayAnno.style.display = 'flex';
        this.tempoUltimoAumentoAnno = performance.now();
        this.lastFrameTime = performance.now();
        this.aggiornaDisplayInfo();
        this.resetPlayerState();
        this.player.style.backgroundImage = `url('${this.spriteCorsa[0]}')`;
        this.pausa = false;
        this.tempoUltimoPuntoSecondo = performance.now();

        this.animationId = requestAnimationFrame((timestamp) => this.cicloGioco(timestamp));
    }

    salta() {
        if (this.stato === 'giocando' && !this.staSaltando) {
            this.staSaltando = true;
            this.playerVelocityY = this.config.INITIAL_JUMP_VELOCITY;
            
            // Si potrebbe aggiungere un suono per il salto
            // this.riproduciSuono('salto');
        }
    }

    aggiornaPosizionePlayer(deltaTime) {
        const targetGroundPos = this.config.PLAYER_POS_FONDO;

        if (!this.staSaltando && parseFloat(this.player.style.bottom) !== targetGroundPos) {
            this.player.style.bottom = `${targetGroundPos}px`;
            this.playerVelocityY = 0;
            return;
        }

        if (!this.staSaltando) return;

        const deltaSeconds = deltaTime / 1000;        
        let currentBottom = parseFloat(this.player.style.bottom);
        let newBottom = currentBottom + (this.playerVelocityY * deltaSeconds * 60);        
        this.playerVelocityY -= (this.config.GRAVITY * deltaSeconds * 60);

        if (newBottom <= targetGroundPos) {
            newBottom = targetGroundPos;
            this.staSaltando = false;
            this.playerVelocityY = 0;
            this.tempoUltimoFrameCorsa = performance.now();
        }
        
        this.player.style.bottom = `${newBottom}px`;
    }

    creaOstacolo() {
        const ostacoloEl = document.createElement('div');
        ostacoloEl.className = 'ostacolo';
        ostacoloEl.style.left = `${this.config.OSTACOLO_START_X}px`;
        ostacoloEl.style.width = `${this.config.OSTACOLO_LARGHEZZA}px`;
        ostacoloEl.style.height = `${this.config.OSTACOLO_ALTEZZA}px`;
        ostacoloEl.style.backgroundImage = `url('${this.immagineMuro.src}')`;
        ostacoloEl.style.bottom = `${this.config.OSTACOLO_POS_FONDO}px`; 
        this.contenitore.appendChild(ostacoloEl);

        const colliderOstacolo = this._creaColliderElement({
            className: 'collider-ostacolo',
            larghezza: this.config.OSTACOLO_COLLIDER_LARGHEZZA,
            altezza: this.config.OSTACOLO_COLLIDER_ALTEZZA,
            offsetX: this.config.OSTACOLO_COLLIDER_OFFSET_X,
            offsetY: this.config.OSTACOLO_COLLIDER_OFFSET_Y
        });
        ostacoloEl.appendChild(colliderOstacolo);
        
        this.ostacoli.push({
            elemento: ostacoloEl,
            x: this.config.OSTACOLO_START_X,
            superato: false
        });
    }

    creaNuvola() {
        const nuvolaEl = document.createElement('div');
        nuvolaEl.className = 'nuvola';
        nuvolaEl.style.left = `${this.config.NUVOLA_START_X}px`;
        nuvolaEl.style.width = `${this.config.NUVOLA_LARGHEZZA}px`;
        nuvolaEl.style.height = `${this.config.NUVOLA_ALTEZZA}px`;
        nuvolaEl.style.top = `${Math.random() * (this.config.NUVOLA_TOP_MAX - this.config.NUVOLA_TOP_MIN) + this.config.NUVOLA_TOP_MIN}px`;
        nuvolaEl.style.backgroundImage = `url('${this.immagineNuvola.src}')`; 
        this.contenitore.appendChild(nuvolaEl);
        
        this.nuvole.push({
            elemento: nuvolaEl,
            x: this.config.NUVOLA_START_X
        });
    }

    aggiornaOstacoli(deltaTime) {
        const spostamento = this.velocitaGioco * (deltaTime / (1000 / 60));

        for (let i = this.ostacoli.length - 1; i >= 0; i--) {
            const ostacolo = this.ostacoli[i];
            ostacolo.x -= spostamento;
            ostacolo.elemento.style.left = `${ostacolo.x}px`;

            if (!ostacolo.superato && ostacolo.x + this.config.OSTACOLO_LARGHEZZA < this.config.PLAYER_POS_SINISTRA) {
                ostacolo.superato = true;
                this.aggiornaPunteggio(this.puntiPerOstacolo);
            }

            // Rimuovi l'ostacolo quando è completamente fuori schermo
            if (ostacolo.x < -this.config.OSTACOLO_LARGHEZZA) {
                ostacolo.elemento.remove();
                this.ostacoli.splice(i, 1);
            }
        }
    }

    aggiornaNuvole(deltaTime) {
        // Le nuvole si muovono più lentamente per creare un effetto parallasse
        const spostamento = this.velocitaGioco * 0.5 * (deltaTime / (1000 / 60));

        for (let i = this.nuvole.length - 1; i >= 0; i--) {
            const nuvola = this.nuvole[i];
            nuvola.x -= spostamento;
            nuvola.elemento.style.left = `${nuvola.x}px`;

            if (nuvola.x < -this.config.NUVOLA_LARGHEZZA) {
                nuvola.elemento.remove();
                this.nuvole.splice(i, 1);
            }
        }
    }

    verificaCollisioni() {
        if (this.stato !== 'giocando') return false;

        let ySpriteBottomPlayer;
        const baseYPlayer = this.config.PLAYER_POS_FONDO;

        if (this.staSaltando) {
            ySpriteBottomPlayer = parseFloat(this.player.style.bottom);
        } else {
            ySpriteBottomPlayer = baseYPlayer;
        }

        const yColliderBottomPlayer = (ySpriteBottomPlayer + this.config.PLAYER_ALTEZZA) - this.config.PLAYER_COLLIDER_OFFSET_Y - this.config.PLAYER_COLLIDER_ALTEZZA;

        const posPlayer = {
            x: this.config.PLAYER_POS_SINISTRA + this.config.PLAYER_COLLIDER_OFFSET_X,
            y: yColliderBottomPlayer,
            larghezza: this.config.PLAYER_COLLIDER_LARGHEZZA,
            altezza: this.config.PLAYER_COLLIDER_ALTEZZA
        };

        for (const ostacolo of this.ostacoli) {
            const ySpriteBottomOstacolo = this.config.OSTACOLO_POS_FONDO;
            const yColliderBottomOstacolo = (ySpriteBottomOstacolo + this.config.OSTACOLO_ALTEZZA) - this.config.OSTACOLO_COLLIDER_OFFSET_Y - this.config.OSTACOLO_COLLIDER_ALTEZZA;

            const posOstacolo = {
                x: ostacolo.x + this.config.OSTACOLO_COLLIDER_OFFSET_X,
                y: yColliderBottomOstacolo, 
                larghezza: this.config.OSTACOLO_COLLIDER_LARGHEZZA,
                altezza: this.config.OSTACOLO_COLLIDER_ALTEZZA
            };

            if (this.collisione(posPlayer, posOstacolo)) {
                this.gameOver();
                return true;
            }
        }
        
        return false;
    }

    collisione(rett1, rett2) {
        return rett1.x < rett2.x + rett2.larghezza &&
               rett1.x + rett1.larghezza > rett2.x &&
               rett1.y < rett2.y + rett2.altezza &&
               rett1.y + rett1.altezza > rett2.y;
    }

    aggiornaPunteggio(puntiDaAggiungere = 1) {
        this.punteggio += puntiDaAggiungere;
        this.elementoPunteggio.textContent = this.punteggio.toString().padStart(this.config.PUNTEGGIO_PADDING, '0');
    }

    aggiornaAnimazioneCorsa(deltaTime) {
        const fattoreVelocitaGioco = this.config.VELOCITA_GIOCO_INIZIALE !== 0 ?
                                    (this.velocitaGioco / this.config.VELOCITA_GIOCO_INIZIALE) : 1;
        const velocitaAnimazioneBase = this.velocitaAnimazioneCorsa / fattoreVelocitaGioco;

        let velocitaAnimazioneAttuale = velocitaAnimazioneBase;
        if (this.staSaltando) {
            velocitaAnimazioneAttuale = velocitaAnimazioneBase * this.config.FATTORE_RALLENTAMENTO_ANIM_SALTO;
        }

        this.tempoUltimoFrameCorsaAccumulato = (this.tempoUltimoFrameCorsaAccumulato || 0) + deltaTime;

        if (this.tempoUltimoFrameCorsaAccumulato > velocitaAnimazioneAttuale) {
            this.frameCorsaCorrente = (this.frameCorsaCorrente + 1) % this.spriteCorsa.length;
            this.player.style.backgroundImage = `url('${this.spriteCorsa[this.frameCorsaCorrente]}')`;
            this.tempoUltimoFrameCorsaAccumulato = 0;
        }
    }

    aggiornaAnnoEVelocita() {
        const tempoAttuale = performance.now();
        if (tempoAttuale - this.tempoUltimoAumentoAnno > this.config.INTERVALLO_AUMENTO_ANNO_MS) {
            if (this.annoCorrente < this.config.ANNO_MASSIMO) {
                this.annoCorrente++;
                this.testoAnno.textContent = this.annoCorrente;
                this.velocitaGioco += this.config.VELOCITA_INCREMENTO_BASE;
                
                // Applica incrementi di velocità progressivi basati sull'anno
                if (this.annoCorrente > 25) {
                    this.velocitaGioco += (this.annoCorrente - 25) * this.config.VELOCITA_INCREMENTO_ANNO_OLTRE_25;
                }
                if (this.annoCorrente > 30) {
                    this.velocitaGioco += (this.annoCorrente - 30) * this.config.VELOCITA_INCREMENTO_ANNO_OLTRE_30;
                }
                if (this.annoCorrente === this.config.ANNO_MASSIMO) {
                    this.velocitaGioco = Math.max(this.velocitaGioco, this.config.VELOCITA_GIOCO_FOLLE);
                }
            }
            this.tempoUltimoAumentoAnno = tempoAttuale;
        }
    }

    cicloGioco(timestamp) {
        if (this.stato !== 'giocando' || this.pausa) return;

        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        const cappedDeltaTime = Math.min(deltaTime, 50);

        this.aggiornaAnimazioneCorsa(cappedDeltaTime);
        this.aggiornaPosizionePlayer(cappedDeltaTime);
        this.aggiornaOstacoli(cappedDeltaTime);
        this.aggiornaNuvole(cappedDeltaTime);
        
        const collisione = this.verificaCollisioni();
        if (collisione) {
            return;
        }
        
        this.aggiornaAnnoEVelocita();

        const tempoCorrente = performance.now();

        if (tempoCorrente - this.tempoUltimoPuntoSecondo > 1000) {
            this.aggiornaPunteggio(1);
            this.tempoUltimoPuntoSecondo = tempoCorrente;
        }

        let intervalloCreazioneOstacolo = this.config.INTERVALLO_CREAZIONE_OSTACOLO_MIN_MS / (this.velocitaGioco / this.config.VELOCITA_GIOCO_INIZIALE);
        intervalloCreazioneOstacolo = Math.max(intervalloCreazioneOstacolo, 500);
        
        if (tempoCorrente - this.tempoUltimoOstacolo > intervalloCreazioneOstacolo + Math.random() * this.config.INTERVALLO_CREAZIONE_OSTACOLO_RANDOM_MS) {
            this.creaOstacolo();
            this.tempoUltimoOstacolo = tempoCorrente;
        }

        if (tempoCorrente - this.tempoUltimaNuvola > this.config.INTERVALLO_CREAZIONE_NUVOLA_MIN_MS + Math.random() * this.config.INTERVALLO_CREAZIONE_NUVOLA_RANDOM_MS) {
            this.creaNuvola();
            this.tempoUltimaNuvola = tempoCorrente;
        }

        this.animationId = requestAnimationFrame((newTimestamp) => this.cicloGioco(newTimestamp));
    }

    gameOver() {
        this.stato = 'gameOver';
        this.messaggioGameOver.innerHTML = `<span class="game-over-title">GAME OVER</span><br><span class="game-over-text">hai hittato il wallo all\'età di ${this.annoCorrente} anni</span>`;
        this.messaggioGameOver.style.display = 'block';
        this.messaggioRiavvio.style.display = 'block';
        this.displayAnno.style.display = 'none';
        this.tempoGameOver = performance.now();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Si potrebbe aggiungere un suono per il game over
        // this.riproduciSuono('gameOver');

        this.testoAnno.textContent = this.annoCorrente; 
        this.elementoPunteggio.textContent = this.punteggio.toString().padStart(this.config.PUNTEGGIO_PADDING, '0');
        this.aggiornaDisplayInfo();
        this.resetPlayerState();
    }

    riavviaGioco() {
        this.ostacoli.forEach(ostacolo => ostacolo.elemento.remove());
        this.nuvole.forEach(nuvola => nuvola.elemento.remove());
        
        this.inizializzaVariabili();
        this.aggiornaDisplayInfo();
        this.resetPlayerState();

        this.iniziaGioco();
    }

    resetPlayerState() {
        this.player.style.bottom = `${this.config.PLAYER_POS_FONDO}px`;
        this.playerVelocityY = 0;
        this.staSaltando = false;
    }

    aggiornaDisplayInfo() {
        this.testoAnno.textContent = this.annoCorrente;
        this.elementoPunteggio.textContent = this.punteggio.toString().padStart(this.config.PUNTEGGIO_PADDING, '0');
    }
}

window.addEventListener('load', () => {
    new GiocoRunner();
}); 