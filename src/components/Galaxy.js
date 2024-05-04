import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GalaxyBackground = () => {
    const mountRef = useRef(null);
    const objectsClickable = useRef([]);  // Ref to store clickable objects
    const [rotationEnabled, setRotationEnabled] = useState(true);  // State to control rotation

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
                setRotationEnabled(!rotationEnabled);  // Toggle rotation on click
            }
        };

        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mousedown', onDocumentMouseDown, false);

        const loader = new THREE.TextureLoader();
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
            map: loader.load('sun_texture.jpeg'),  // Ensure correct texture path
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
            map: loader.load('earthmap1k.jpeg'),  // Ensure correct texture path
            specularMap: loader.load('earthspec1k.jpeg'),
            normalMap: loader.load('earth_normalmap_flat.jpeg'),
            normalScale: new THREE.Vector2(0.5, 0.5),
            shininess: 10
        });
        const earth = new THREE.Mesh(earthGeometry, earthMaterial);
        earth.position.set(5, 0, 0);
        earth.name = 'Earth';
        earthOrbit.add(earth);
        objectsClickable.current.push(earth);

        const moonOrbit = new THREE.Object3D();
        earth.add(moonOrbit);

        const moonGeometry = new THREE.SphereGeometry(0.14, 32, 32);
        const moonMaterial = new THREE.MeshPhongMaterial({
            map: loader.load('moonmap1k.jpeg')  // Ensure correct texture path
        });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.set(1, 0, 0);
        moon.name = 'Moon';
        moonOrbit.add(moon);
        objectsClickable.current.push(moon);

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
                earthOrbit.rotateY(0.005);  // Rotate Earth orbit if rotation is enabled
                moonOrbit.rotateY(0.01);    // Rotate Moon orbit if rotation is enabled
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
    }, [rotationEnabled]);  // Re-run the effect when rotationEnabled changes

    return <div ref={mountRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default GalaxyBackground;
