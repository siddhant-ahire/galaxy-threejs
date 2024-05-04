import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GalaxyBackground = () => {
    const mountRef = useRef(null);
    const objectsClickable = useRef([]);
    const [rotationEnabled, setRotationEnabled] = useState(true);
    const [rotationSpeed, setRotationSpeed] = useState(0.005);  // Initial speed for Earth orbit

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onDocumentMouseMove = event => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objectsClickable.current);
            document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
        };

        const onDocumentMouseDown = event => {
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objectsClickable.current);
            if (intersects.length > 0) {
                console.log(`Clicked on: ${intersects[0].object.name}`);
            }
        };

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);

        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            sizeAttenuation: true
        });
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        const sunGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load('sun_texture.jpeg'),  // Ensure correct texture path
            emissive: 0xFFFF00,
            emissiveIntensity: 1
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(0, 0, 0);
        scene.add(sun);

        const sunlight = new THREE.PointLight(0xffffff, 3, 1000);
        sunlight.position.copy(sun.position);
        scene.add(sunlight);

        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);

        const earthOrbit = new THREE.Object3D();
        sun.add(earthOrbit);

        const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const earthMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('earthmap1k.jpeg'),  // Ensure correct texture path
            specularMap: new THREE.TextureLoader().load('earthspec1k.jpeg'),
            normalMap: new THREE.TextureLoader().load('earth_normalmap_flat.jpeg'),
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 10
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.position.set(5, 0, 0);
        earth.name = 'Earth';
        earthOrbit.add(earth);
        objectsClickable.current.push(earth);

        const earthLight = new THREE.PointLight(0x4B92DC, 1.5, 100);
        earthLight.position.set(5, 0, 10);  // Position slightly away from the Earth to simulate sunlight
        scene.add(earthLight);

        const moonOrbit = new THREE.Object3D();
        earth.add(moonOrbit);

        const moonGeometry = new THREE.SphereGeometry(0.14, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('moonmap1k.jpeg')  // Ensure correct texture path
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(1, 0, 0);
        moon.name = 'Moon';
        moonOrbit.add(moon);
        objectsClickable.current.push(moon);

        const moonLight = new THREE.PointLight(0x888888, 0.5, 50);
        moonLight.position.set(6, 0, 1);  // Position slightly away from the Moon
        scene.add(moonLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = true;
        controls.zoomSpeed = 1.0;
        controls.minDistance = 2;
        controls.maxDistance = 20;
        controls.enablePan = true;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        camera.position.set(10, 5, 10);

        const animate = () => {
            requestAnimationFrame(animate);
            if (rotationEnabled) {
                // Adjust rotation based on speed state
                earthOrbit.rotateY(rotationSpeed);
                moonOrbit.rotateY(rotationSpeed * 2);  // Moon rotates faster
            }
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            document.removeEventListener('mousemove', onDocumentMouseMove);
            document.removeEventListener('mousedown', onDocumentMouseDown);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, [rotationEnabled, rotationSpeed]);  // Depend on rotationSpeed as well

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <button
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '5px 10px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                onClick={() => setRotationEnabled(!rotationEnabled)}
            >
                {rotationEnabled ? 'Stop Rotation' : 'Start Rotation'}
            </button>
            <button
                style={{
                    position: 'absolute',
                    top: '50px',
                    right: '10px',
                    padding: '5px 10px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                onClick={() => setRotationSpeed(rotationSpeed + 0.001)}
            >
                Faster
            </button>
            <button 
                style={{
                    position: 'absolute',
                    top: '70px',
                    right: '10px',
                    padding: '5px 10px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >{(parseInt(rotationSpeed.toFixed(3)*1000))}</button>
            <button
                style={{
                    position: 'absolute',
                    top: '90px',
                    right: '10px',
                    padding: '5px 10px',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
                onClick={() => setRotationSpeed(Math.max(0, rotationSpeed - 0.001))}
            >
                Slower
            </button>
        </div>
    );
};

export default GalaxyBackground;
