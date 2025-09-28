
# Fish Health & Community Reporting Platform – Product Requirements Document (MVP)

## Objective
The platform is a web-based system enabling local communities to **report fish health problems**, track water quality issues, and provide authorities with real-time insights for intervention. It combines **community reporting, basic AI-assisted diagnosis, and a knowledge hub** to reduce fish mortality, protect biodiversity, and safeguard local livelihoods dependent on fishing.  

The hackathon MVP will demonstrate the core flow: reporting sick/dead fish → automated preliminary diagnosis → dashboard tracking → authority response.

---

## Background & Problem
Fish are a critical food and income source for riverside and rural communities. However, **diseases, water pollution, and dam-related ecosystem changes** cause massive fish kills each year.  

Key challenges include:  
- **Lack of Real-Time Reporting**: Authorities often receive news after major damage has occurred.  
- **Limited Access to Knowledge**: Communities may not know fish diseases or how to mitigate them.  
- **Slow Response**: No centralized dashboard to prioritize hotspots for immediate inspection.  

This results in **economic losses, food insecurity, and declining biodiversity**. The platform aims to bridge the gap between communities and authorities with fast, transparent, and collaborative monitoring.

---

## Solution Overview
The solution is a **web application (mobile-friendly)** that enables:  
1. **Community Reporting** – Residents upload fish disease reports (species, symptoms, location, photos/videos).  
2. **Fish Diagnosis AI** – Automated preliminary analysis suggests possible diseases and basic prevention steps.  
3. **Hotspot Dashboard** – Interactive map showing cases, statuses, and inspection updates by authorities.  
4. **Fishpedia Knowledge Base** – Educational database of local fish species, common diseases, and care practices.  

Future extensions include IoT sensor data integration, advanced analytics, and community forums.

---

## Scope of MVP
For the hackathon prototype, the focus is on:  
- **Geographic Focus**: One pilot river or district.  
- **Core Features Only**: Reporting, AI-based diagnosis, and dashboard.  
- **Simplified Diagnosis**: Rule-based or small AI model (simulated) for identifying common fish diseases.  
- **Authority Workflow Simulation**: Case status updates (Pending, In Progress, Resolved).  

### Out of Scope
- Full scientific accuracy of diagnosis.  
- Large-scale IoT deployment.  
- Comprehensive fish disease models.  

---

## Key Features & MVP Implementation

### 1. Community Reporting
**Feature:** Allow local residents to log cases of sick or dead fish.  
- **Inputs**: Fish species, symptoms (e.g., red gills, white spots, mass deaths), GPS location, photo/video upload.  
- **Output**: Case stored in database and displayed on map.  

**MVP Implementation:**  
- Web form for input.  
- Simple upload option for images.  
- Location captured via map pin or manual entry.  

---

### 2. Fish Diagnosis AI / Knowledge Base
**Feature:** Provide automated preliminary disease identification.  
- **Examples**: White Spot Disease, Columnaris, Parasitic infections.  
- **Prevention Tips**: Add salt, reduce density, test water quality.  

**MVP Implementation:**  
- Rule-based diagnosis (if “white spots” → White Spot Disease).  
- Small pre-trained AI model or simulated output via GPT API.  
- Provide 2–3 possible diagnoses with prevention tips.  

---

### 3. Dashboard & Hotspot Tracking
**Feature:** Interactive map for case visualization and monitoring.  
- **Hotspots**: Clusters of reported cases.  
- **Case Status**: Pending / Under Investigation / Resolved.  
- **Authority Access**: Local officials update inspection results.  

**MVP Implementation:**  
- Mapbox or Leaflet for hotspot map.  
- Simple status-change function for admin accounts.  
- Case timeline shown in dashboard.  

---

### 4. Fishpedia (Knowledge Hub)
**Feature:** Educational database of local fish species.  
- **Data**: Fish images, habitat, common diseases, care practices.  
- **Purpose**: Raise awareness, support schools/communities.  

**MVP Implementation:**  
- Static database (JSON) of 5–10 common species.  
- Simple detail pages with species info + related diseases.  

---

## Additional Features (Future Enhancements)
- **Alert System**: Automatic notifications if case density exceeds threshold.  
- **Water Quality Integration**: IoT sensor data (DO, pH, temperature).  
- **Community Forum**: Q&A space for farmers, fishers, and experts.  

---

## Tech Stack & Architecture
- **Frontend**: React / Next.js for web interface.  
- **Backend**: Node.js or Python (Flask/FastAPI) for case management.  
- **Database**: MongoDB or Firebase for flexible case storage.  
- **Mapping**: Mapbox GL or Leaflet with OpenStreetMap basemap.  
- **AI Integration**: GPT API for simulated diagnosis text.  
- **Deployment**: Vercel (frontend) + serverless backend.  

---

## User Journey & Demo Scenario
1. **Resident reports sick fish** with photos and symptoms.  
2. **System suggests diagnosis** (e.g., “White Spot Disease likely – prevention: add salt, reduce density”).  
3. **Case appears on dashboard map** with status “Pending”.  
4. **Authority reviews and updates status** → “Under Investigation”.  
5. After site visit, authority marks case as “Resolved”.  
6. Community members check the map and learn from **Fishpedia** to prevent future outbreaks.  

---

## Challenges & Considerations
- **Accuracy**: AI diagnosis is advisory, not medical-grade.  
- **Adoption**: Needs trust from communities and authorities.  
- **Connectivity**: Some rural areas may have limited internet access.  

---

## Potential Impact
- **Fisheries Protection**: Early detection reduces mass fish deaths.  
- **Community Empowerment**: Farmers actively participate in monitoring.  
- **Transparency**: Public dashboard increases trust in authority response.  
- **Education**: Fishpedia promotes awareness among youth and locals.  

---

## Conclusion
The MVP will prove the **concept of crowdsourced fish health monitoring**. By empowering communities to report cases, supporting them with AI-driven guidance, and enabling authorities to respond efficiently, the platform bridges the gap between local knowledge and institutional action.  

This creates a **scalable solution for aquatic health monitoring** that protects biodiversity, livelihoods, and food security.  
