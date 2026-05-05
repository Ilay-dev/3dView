import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './SceneManager.js';
import { state } from '../state.js';

export const ModelManager = {
    currentModelGroup: null,
    currentInitialScale: 1.0,

    loadModel(filename) {
        const loader = new GLTFLoader();
        const path = 'models/' + filename;

        loader.load(path, (gltf) => {
            if (this.currentModelGroup) {
                scene.remove(this.currentModelGroup);
                this.currentModelGroup = null;
            }

            const model = gltf.scene;
            this.currentModelGroup = model;

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            const scale = 0.1 / (maxDim || 1); 
            model.scale.set(scale, scale, scale);
            this.currentInitialScale = scale;

            model.position.set(0, 0, 0);
            scene.add(model);

            state.mixer = null;
            if (gltf.animations && gltf.animations.length > 0) {
                state.mixer = new THREE.AnimationMixer(model);
                const action = state.mixer.clipAction(gltf.animations[0]);
                action.play();
            }
        }, 
        undefined, 
        (e) => {
            console.error("Error loading " + filename, e);
        });
    },

    async loadEnvironment() {
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
            opt.innerText = "No models found";
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

            this.loadModel(models[0]);
        }
    }
};
