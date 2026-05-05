import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './SceneManager.js';
import { state } from '../state.js';

export const ModelManager = {
    currentModelGroup: null,
    currentInitialScale: 1.0,

    loadModel(filename) {
        const loader = new GLTFLoader();
        // Pfad angepasst: Geht eine Ebene hoch aus 'src/' raus in 'models/'
        const path = '../models/' + filename;

        loader.load(path, (gltf) => {
            // Vorheriges Modell entfernen
            if (this.currentModelGroup) {
                scene.remove(this.currentModelGroup);
                this.currentModelGroup = null;
            }

            const model = gltf.scene;
            this.currentModelGroup = model;

            // Größe berechnen und automatisch skalieren
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            // Skalierung auf ca. 10 Einheiten (anpassen falls zu klein/groß)
            const scale = 0.1 / (maxDim || 1); 
            model.scale.set(scale, scale, scale);
            this.currentInitialScale = scale;

            model.position.set(0, 0, 0);
            scene.add(model);

            // Animationen starten, falls vorhanden
            state.mixer = null;
            if (gltf.animations && gltf.animations.length > 0) {
                state.mixer = new THREE.AnimationMixer(model);
                const action = state.mixer.clipAction(gltf.animations[0]);
                action.play();
                console.log("Animation läuft: " + gltf.animations[0].name);
            }

            console.log("Modell geladen: " + filename);
        }, 
        undefined, 
        (e) => console.error("Fehler beim Laden von " + filename + ". Pfad geprüft? -> " + path, e));
    },

    async loadEnvironment() {
        // Da GitHub Pages kein Directory Listing erlaubt, 
        // nehmen wir die Namen direkt aus deinem Screenshot:
        const models = [
            'Rotate_Laser.glb',
            'f_22.glb',
            'gun.glb',
            'mesh_man.glb',
            'realistic_human_heart.glb'
        ];

        const select = document.getElementById('model-select');
        if (!select) return;

        select.innerHTML = '';

        if (models.length === 0) {
            const opt = document.createElement('option');
            opt.innerText = "Keine Modelle gefunden";
            select.appendChild(opt);
        } else {
            models.sort();

            models.forEach(modelName => {
                const opt = document.createElement('option');
                opt.value = modelName;
                opt.innerText = modelName;
                select.appendChild(opt);
            });

            select.addEventListener('change', (e) => {
                this.loadModel(e.target.value);
            });

            // Das erste Modell der Liste sofort laden
            this.loadModel(models[0]);
        }
    }
};
