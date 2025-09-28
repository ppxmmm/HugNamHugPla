"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";

type Report = {
  id: string;
  species: string;
  symptoms: string;
  latitude: number;
  longitude: number;
  diagnosis: string[];
  careInstructions: string[];
  medicines: string[];
  recommendedSpecies: string[];
  status: "Pending" | "Under Investigation" | "Resolved";
  createdAt: string;
  governmentNotes?: string;
  reporterId: string;
  imageUrl?: string;
};

type FishSpecies = {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  habitat: string;
  description: string;
  conservationStatus: string;
  imageUrl?: string;
};

type Discussion = {
  id: string;
  reportId?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: Discussion[];
  isPost?: boolean;
  title?: string;
};

type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
};

const defaultCenter: LatLngExpression = [13.736717, 100.523186];

const Map = dynamic(() => import("./components/Map"), { ssr: false });

// Mekong River Fish Database
const mekongFishSpecies: FishSpecies[] = [
  {
    id: "1",
    commonName: "ปลาบึก",
    scientificName: "Pangasianodon gigas",
    family: "Pangasiidae",
    habitat: "แอ่งน้ำลึกของแม่น้ำโขง",
    description: "ปลาน้ำจืดที่ใหญ่ที่สุดในโลก ยาวได้ถึง 3 เมตร หนักกว่า 300 กก. ใกล้สูญพันธุ์อย่างยิ่งจากการทำประมงเกินขนาดและเขื่อน",
    conservationStatus: "ใกล้สูญพันธุ์อย่างยิ่ง",
    imageUrl: "/ปลาบึก.jpg"
  },
  {
    id: "2",
    commonName: "ปลาเสือตอ",
    scientificName: "Datnioides pulcher",
    family: "Datnioididae",
    habitat: "แม่น้ำและลำธารน้ำจืด",
    description: "ลายขวางเด่นคล้ายเสือ นิยมในตู้ปลา แต่เสี่ยงจากการสูญเสียถิ่นอาศัย",
    conservationStatus: "ใกล้สูญพันธุ์",
    imageUrl: "/ปลาเสือตอ.jpg"
  },
  {
    id: "3",
    commonName: "ปลาแรดแม่น้ำ (Giant Barb)",
    scientificName: "Catlocarpio siamensis",
    family: "Cyprinidae",
    habitat: "แม่น้ำสายใหญ่และทุ่งน้ำหลาก",
    description: "ปลาตระกูลตะเพียนขนาดใหญ่ ยาวได้ถึง 1.5 ม. สำคัญต่อการประมงพื้นบ้าน",
    conservationStatus: "เสี่ยงใกล้สูญพันธุ์",
    imageUrl: "/ปลาแรดแม่น้ำ.jpg"
  },
  {
    id: "4",
    commonName: "ปลาตะเพียนขาว",
    scientificName: "Barbonymus gonionotus",
    family: "Cyprinidae",
    habitat: "แม่น้ำ คู คลอง และทุ่งน้ำหลาก",
    description: "ปลาพื้นบ้านสำคัญของเอเชียตะวันออกเฉียงใต้ เลี้ยงง่าย โตเร็ว",
    conservationStatus: "มีความเสี่ยงต่ำ",
    imageUrl: "/ปลาตะเพียนขาว.jpg"
  },
  {
    id: "5",
    commonName: "ปลาช่อน",
    scientificName: "Channa striata",
    family: "Channidae",
    habitat: "หนองน้ำ บึง และแม่น้ำไหลเอื่อย",
    description: "ทนทาน หายใจอากาศได้โดยตรง พบทั่วไป ใช้เป็นอาหารสำคัญ",
    conservationStatus: "มีความเสี่ยงต่ำ",
    imageUrl: "/ปลาช่อน.jpg"
  },
  {
    id: "6",
    commonName: "ปลากราย",
    scientificName: "Chitala ornata",
    family: "Notopteridae",
    habitat: "แม่น้ำและบึงน้ำจืด",
    description: "ลำตัวยาวแบนเป็นรูปมีด มีจุดลายสวยงาม นิยมเลี้ยง",
    conservationStatus: "มีความเสี่ยงต่ำ",
    imageUrl: "/ปลากราย.jpg"
  },
  {
    id: "7",
    commonName: "ปลากดคัง",
    scientificName: "Hemibagrus wyckioides",
    family: "Bagridae",
    habitat: "แอ่งน้ำลึกในแม่น้ำโขง",
    description: "ปลาหนังนักล่าขนาดใหญ่ นิยมบริโภคในท้องถิ่น",
    conservationStatus: "ข้อมูลไม่เพียงพอ",
    imageUrl: "/ปลากดคัง.jpg"
  },
  {
    id: "8",
    commonName: "ปลาเข็ง (Mekongina)",
    scientificName: "Mekongina erythrospila",
    family: "Cyprinidae",
    habitat: "แม่น้ำโขงตอนกลาง",
    description: "ปลาพื้นถิ่นแม่น้ำโขง กินแพลงก์ตอนพืชและสาหร่าย",
    conservationStatus: "ใกล้ถูกคุกคาม",
    imageUrl: "/ปลาเข็ง.jpg"
  }
];

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [species, setSpecies] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [lat, setLat] = useState<string>("13.736717");
  const [lng, setLng] = useState<string>("100.523186");
  const previewPosition = useMemo(() => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isFinite(parsedLat) && isFinite(parsedLng)) {
      return [parsedLat, parsedLng] as LatLngExpression;
    }
    return undefined;
  }, [lat, lng]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "dashboard" | "fish-info" | "community">("community");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [showOnlyMine, setShowOnlyMine] = useState<boolean>(false);
  const [currentPosition, setCurrentPosition] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [newComment, setNewComment] = useState("");
  const [selectedReportForDiscussion, setSelectedReportForDiscussion] = useState<string>("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const captureFromCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.addEventListener('loadedmetadata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageDataUrl);
        
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('ไม่สามารถเข้าถึงกล้องได้ กรุณาตรวจสอบการอนุญาต');
    }
  };

  const diagnose = (text: string): { diagnosis: string[], careInstructions: string[], medicines: string[], recommendedSpecies: string[] } => {
    const t = text.toLowerCase();
    const dx: string[] = [];
    const care: string[] = [];
    const meds: string[] = [];
    const hardySpecies: string[] = [];
    
    if (t.includes("white spot") || t.includes("ich") || t.includes("white dots")) {
      dx.push("White Spot Disease (Ich)");
      care.push("เติมเกลือ (1-3 ช้อนชาต่อน้ำ 1 แกลลอน)", "ปรับอุณหภูมิขึ้นเล็กน้อยหากปลอดภัย", "เพิ่มการให้อากาศและการไหลเวียน", "แยกปลาป่วยหากทำได้");
      meds.push("มาลาไคท์กรีน (ใช้ด้วยความระมัดระวัง)", "ฟอร์มาลินตามฉลาก", "เกลือแกงบริสุทธิ์");
      hardySpecies.push("ปลาตะเพียนขาว", "ปลาช่อน");
    }
    if (t.includes("red gill") || t.includes("gill") || t.includes("ammonia")) {
      dx.push("Gill irritation/Ammonia poisoning");
      care.push("ตรวจค่ามลพิษแอมโมเนีย/ไนไตรท์", "เพิ่มการให้อากาศทันที", "เปลี่ยนน้ำ 50%", "ลดอาหารเพื่อลดของเสีย");
      meds.push("แบคทีเรียบูสเตอร์/กรองชีวภาพ", "คอนดิชันเนอร์กำจัดคลอรีนและแอมโมเนีย");
      hardySpecies.push("ปลาช่อน", "ปลาตะเพียนขาว");
    }
    if (t.includes("cotton") || t.includes("fungus") || t.includes("mold")) {
      dx.push("Fungal infection");
      care.push("แยกปลาป่วย", "ปรับคุณภาพน้ำและเปลี่ยนน้ำบ่อยขึ้น", "พิจารณายาต้านเชื้อรา", "เพิ่มอุณหภูมิเล็กน้อย");
      meds.push("เมทิลีนบลู", "คอปเปอร์ซัลเฟต (ตามคำแนะนำผู้เชี่ยวชาญ)");
      hardySpecies.push("ปลาตะเพียนขาว");
    }
    if (t.includes("ulcer") || t.includes("lesion") || t.includes("sores")) {
      dx.push("Bacterial ulcer (Columnaris)");
      care.push("ลดความหนาแน่นของปลา", "ปรับปรุงคุณภาพน้ำและระบบกรอง", "เติมเกลือช่วยลดความเครียด", "เฝ้าระวังการติดเชื้อรอง");
      meds.push("ออกซีเตตราไซคลิน (ตามสัตวแพทย์)", "โพแทสเซียมเปอร์แมงกาเนต แช่สั้น");
      hardySpecies.push("ปลาช่อน");
    }
    if (t.includes("mass death") || t.includes("many dead") || t.includes("floating")) {
      dx.push("Possible pollution event");
      care.push("แจ้งหน่วยงานรัฐทันที", "บันทึกเหตุการณ์ด้วยภาพถ่าย", "ตรวจสอบต้นน้ำว่ามีการปล่อยของเสียหรือไม่", "ตรวจค่าคุณภาพน้ำหลัก ๆ");
      meds.push("ถ่านกัมมันต์/ตัวดูดซับสารพิษในระบบกรอง");
    }
    if (dx.length === 0) {
      dx.push("General health concern");
      care.push("เพิ่มการให้อากาศ", "เปลี่ยนน้ำบางส่วน 25-30%", "เฝ้าสังเกตอาการ", "ตรวจค่าพื้นฐาน pH อุณหภูมิ แอมโมเนีย");
      hardySpecies.push("ปลาตะเพียนขาว");
    }
    
    return { diagnosis: dx.slice(0, 3), careInstructions: care.slice(0, 4), medicines: meds.slice(0, 4), recommendedSpecies: Array.from(new Set(hardySpecies)).slice(0, 3) };
  };

  useEffect(() => {
    let sid = localStorage.getItem("hn_session_id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("hn_session_id", sid);
    }
    setSessionId(sid);
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: la, longitude: lo } = pos.coords;
        setLat(la.toFixed(6));
        setLng(lo.toFixed(6));
        setCurrentPosition([la, lo]);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = diagnose(symptoms);
    const report: Report = {
      id: crypto.randomUUID(),
      species: species || "Unknown",
      symptoms,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      diagnosis: result.diagnosis,
      careInstructions: result.careInstructions,
      medicines: result.medicines,
      recommendedSpecies: result.recommendedSpecies,
      status: "Pending",
      createdAt: new Date().toISOString(),
      reporterId: sessionId || "anon",
      imageUrl: selectedImage || undefined,
    };
    setReports((prev) => [report, ...prev]);
    formRef.current?.reset();
    setSpecies("");
    setSymptoms("");
    setLat("13.736717");
    setLng("100.523186");
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSubmitting(false);
  };

  const updateReportStatus = (reportId: string, status: "Pending" | "Under Investigation" | "Resolved", notes?: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId 
        ? { ...r, status, governmentNotes: notes }
        : r
    ));
  };

  const addDiscussion = (reportId: string, content: string) => {
    if (!content.trim()) return;
    const discussion: Discussion = {
      id: crypto.randomUUID(),
      reportId,
      authorId: sessionId,
      authorName: `User ${sessionId.slice(0, 8)}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setDiscussions(prev => [discussion, ...prev]);
    setNewComment("");
  };

  const addPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const post: Discussion = {
      id: crypto.randomUUID(),
      authorId: sessionId,
      authorName: `User ${sessionId.slice(0, 8)}`,
      title: newPostTitle,
      content: newPostContent,
      createdAt: new Date().toISOString(),
      isPost: true,
    };
    setDiscussions(prev => [post, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
  };

  const addReply = (postId: string, content: string) => {
    if (!content.trim()) return;
    const reply: Discussion = {
      id: crypto.randomUUID(),
      authorId: sessionId,
      authorName: `User ${sessionId.slice(0, 8)}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setDiscussions(prev => prev.map(d => 
      d.id === postId 
        ? { ...d, replies: [...(d.replies || []), reply] }
        : d
    ));
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: chatInput,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // AI Response
    const aiResponse = generateAIResponse(chatInput);
    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: aiResponse,
      isUser: false,
      timestamp: new Date().toISOString(),
    };
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
    
    setChatInput("");
  };

  const generateAIResponse = (input: string): string => {
    const text = input.toLowerCase();
    
    if (text.includes("fish") && (text.includes("sick") || text.includes("disease") || text.includes("symptom") || text.includes("white") || text.includes("red") || text.includes("dead"))) {
      setTimeout(() => setActiveTab("report"), 1500);
      return "ฉันสามารถช่วยคุณเรื่องปัญหาสุขภาพปลาได้! สำหรับการวินิจฉัยและคำแนะนำการรักษาโดยละเอียด กรุณาไปที่แท็บ 'รายงานสุขภาพปลา' คุณสามารถอธิบายอาการของปลาและรับคำแนะนำการดูแล ยา และการรักษาที่แนะนำจาก AI";
    }
    
    if (text.includes("mekong") || text.includes("fish") || text.includes("species")) {
      setTimeout(() => setActiveTab("fish-info"), 1500);
      return "ดูแท็บ 'ข้อมูลปลาแม่น้ำโขง' เพื่อเรียนรู้เกี่ยวกับสายพันธุ์ปลาต่างๆ ในแม่น้ำโขง ถิ่นอาศัย สถานะการอนุรักษ์ และข้อมูลรายละเอียดเพิ่มเติม!";
    }
    
    if (text.includes("report") || text.includes("problem") || text.includes("issue")) {
      setTimeout(() => setActiveTab("report"), 1500);
      return "คุณสามารถรายงานปัญหาสุขภาพปลาในแท็บ 'รายงานสุขภาพปลา' เพียงอธิบายอาการ สายพันธุ์ และตำแหน่งที่พบ และคุณจะได้รับการวินิจฉัยจาก AI และคำแนะนำการดูแลทันที!";
    }
    
    return "สวัสดี! ฉันอยู่ที่นี่เพื่อช่วยตอบคำถามเกี่ยวกับสุขภาพปลา คุณสามารถถามฉันเกี่ยวกับอาการปลา โรค สายพันธุ์ปลาแม่น้ำโขง หรือวิธีการรายงานปัญหา มีอะไรอยากรู้ไหม?";
  };

  const center = useMemo(() => defaultCenter, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "report":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">รายงานสุขภาพปลา</h1>
              <p className="text-gray-600">รายงานปัญหาสุขภาพปลาและรับคำแนะนำการรักษา</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-auto lg:h-[1000px]">
              <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-4 lg:p-6 shadow-sm">
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สายพันธุ์</label>
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ปลาบึก, ปลาเสือตอ, ปลาตะเพียน..."
                      onChange={(e) => setSpecies(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">อาการ</label>
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 h-24 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="จุดขาว, เหงือกแดง, ตายเป็นจำนวนมาก..."
                      onChange={(e) => setSymptoms(e.target.value)}
                    />
                    {symptoms && (
                      <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="font-medium text-blue-800 mb-2">คำแนะนำการดูแลจาก AI:</div>
                        <ul className="list-disc ml-4 text-blue-700 space-y-1">
                          {diagnose(symptoms).careInstructions.map((instruction, i) => (
                            <li key={i}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Photo Upload Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รูปถ่ายปลา</label>
                    <div className="space-y-4">
                      {selectedImage && (
                        <div className="relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={selectedImage} 
                            alt="Selected fish" 
                            className="w-full h-48 object-cover rounded-xl border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 px-3 lg:px-4 py-2 border border-gray-200 rounded-xl text-xs lg:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          📷 เลือกรูป
                        </button>
                        <button
                          type="button"
                          onClick={captureFromCamera}
                          className="flex-1 px-3 lg:px-4 py-2 bg-green-600 text-white rounded-xl text-xs lg:text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          📸 ถ่ายรูป
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ละติจูด</label>
                      <input
                        className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ลองจิจูด</label>
                      <input
                        className="w-full border border-gray-200 rounded-xl px-3 lg:px-4 py-2 lg:py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={useMyLocation} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors" disabled={locating}>
                      {locating ? "กำลังค้นหาตำแหน่ง..." : "ใช้ตำแหน่งของฉัน"}
                    </button>
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={showOnlyMine} onChange={(e) => setShowOnlyMine(e.target.checked)} className="rounded" />
                      แสดงเฉพาะรายงานของฉัน
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    ส่งรายงาน
                  </button>
                </form>

                {reports.length > 0 && (
                  <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">ผลการวิเคราะห์ล่าสุด</h3>
                    <div className="space-y-4">
                      {reports[0].imageUrl && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">รูปภาพที่รายงาน</h4>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={reports[0].imageUrl} 
                            alt="Reported fish" 
                            className="w-full h-32 object-cover rounded-xl border border-gray-200"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">การวิเคราะห์โรค (AI)</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                          {reports[0].diagnosis.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">แนวทางดูแลรักษา</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                          {reports[0].careInstructions.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">ยาที่แนะนำ</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                          {reports[0].medicines.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">แนะนำสายพันธุ์ที่ทนทาน</h4>
                        <div className="text-sm text-gray-600">{reports[0].recommendedSpecies.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              

              <div className="w-full lg:w-[600px] h-[400px] lg:h-full bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="h-full">
                  <Map
                    center={center}
                    markers={(showOnlyMine ? reports.filter(r => r.reporterId === sessionId) : reports).map((r) => ({
                      id: r.id,
                      position: [r.latitude, r.longitude] as LatLngExpression,
                      popup: `${r.species} – ${r.status}`,
                    }))}
                    previewPosition={previewPosition}
                    onClickSetPosition={(newLat, newLng) => {
                      setLat(newLat.toFixed(6));
                      setLng(newLng.toFixed(6));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">แดชบอร์ดรัฐบาล</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded">
                  <div className="text-2xl font-bold text-red-600">{reports.filter(r => r.status === "Pending").length}</div>
                  <div className="text-sm text-red-700">รอการตรวจสอบ</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <div className="text-2xl font-bold text-yellow-600">{reports.filter(r => r.status === "Under Investigation").length}</div>
                  <div className="text-sm text-yellow-700">กำลังตรวจสอบ</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">{reports.filter(r => r.status === "Resolved").length}</div>
                  <div className="text-sm text-green-700">แก้ไขแล้ว</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-4 items-start flex-1">
                      {report.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={report.imageUrl} 
                          alt="Report" 
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="font-medium">{report.species}</h3>
                        <p className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      report.status === "Pending" ? "bg-red-100 text-red-800" :
                      report.status === "Under Investigation" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{report.symptoms}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateReportStatus(report.id, "Under Investigation", "Inspector assigned")}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      เริ่มตรวจสอบ
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, "Resolved", "Water quality tested, no issues found")}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                    >
                      แก้ไขแล้ว
                    </button>
                  </div>
                  {report.governmentNotes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>หมายเหตุรัฐบาล:</strong> {report.governmentNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "fish-info":
        return (
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">ปลาในแม่น้ำโขง</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mekongFishSpecies.map((fish) => (
                <div key={fish.id} className="card p-0 overflow-hidden">
                  {fish.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={fish.imageUrl} 
                      alt={fish.commonName} 
                      className="w-full h-40 object-cover" 
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  )}
                  {!fish.imageUrl && (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src="/logo.jpg" 
                        alt="Fish placeholder" 
                        className="w-16 h-16 object-cover opacity-50"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{fish.commonName}</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ชื่อวิทยาศาสตร์:</span> {fish.scientificName}
                      </div>
                      <div>
                        <span className="font-medium">วงศ์:</span> {fish.family}
                      </div>
                      <div>
                        <span className="font-medium">แหล่งอาศัย:</span> {fish.habitat}
                      </div>
                      <div>
                        <span className="font-medium">สถานะการอนุรักษ์:</span>
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          fish.conservationStatus.includes("สูญพันธุ์") ? "bg-red-100 text-red-800" :
                          fish.conservationStatus.includes("ใกล้สูญพันธุ์") ? "bg-orange-100 text-orange-800" :
                          fish.conservationStatus.includes("เสี่ยง") ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {fish.conservationStatus}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-2">{fish.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "community":
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">ฟอรั่มชุมชน</h1>
              <p className="text-gray-600">แลกเปลี่ยนเรื่องราว แบ่งปันความรู้ และร่วมกันหาคำตอบเพื่อพัฒนาคุณภาพชีวิตของชุมชน</p>
            </div>
            
            {/* New Post Form */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">ถามคำถามหรือแบ่งปันประสบการณ์</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="หัวข้อโพสต์..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="อธิบายปัญหาสุขภาพปลา ขอคำแนะนำ หรือแบ่งปันประสบการณ์..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 h-24 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <button
                  onClick={addPost}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  โพสต์คำถาม
                </button>
              </div>
            </div>

            {/* Community Posts */}
            <div className="space-y-6">
              {discussions.filter(d => d.isPost).map((post) => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{post.authorName}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {post.replies?.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 rounded-xl p-4 ml-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-900">{reply.authorName}</span>
                          <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.content}</p>
                      </div>
                    ))}
                    
                    <div className="flex gap-3 ml-4">
                      <input
                        type="text"
                        placeholder="ตอบคำถามนี้..."
                        value={selectedReportForDiscussion === post.id ? newComment : ""}
                        onChange={(e) => {
                          setSelectedReportForDiscussion(post.id);
                          setNewComment(e.target.value);
                        }}
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => addReply(post.id, newComment)}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                      >
                        ตอบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {discussions.filter(d => d.isPost).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src="/logo.jpg" 
                      alt="Community" 
                      className="w-12 h-12 object-cover rounded-full opacity-60"
                    />
                  </div>
                  <p className="text-gray-500 text-lg">ยังไม่มีโพสต์ในชุมชน</p>
                  <p className="text-gray-400 text-sm mt-1">เริ่มต้นด้วยการถามคำถามแรก!</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 py-3 lg:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.jpg" 
                alt="HugNamHugPla Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-base lg:text-lg text-gray-900">HugNamHugPla</div>
              <div className="text-xs text-gray-500 hidden sm:block">รายงานสุขภาพปลาและจุดร้อน</div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
            <span>โครงการนำร่อง: นครพนม</span>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <nav className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab("community")}
              className={`px-3 lg:px-4 py-3 rounded-lg font-medium text-xs lg:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "community"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              ชุมชน
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 lg:px-4 py-3 rounded-lg font-medium text-xs lg:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "report"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              รายงานสุขภาพปลา
            </button>
            <button
              onClick={() => setActiveTab("fish-info")}
              className={`px-3 lg:px-4 py-3 rounded-lg font-medium text-xs lg:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "fish-info"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              ข้อมูลปลาแม่น้ำโขง
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 lg:px-4 py-3 rounded-lg font-medium text-xs lg:text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              แดชบอร์ดรัฐบาล
            </button>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-4 lg:py-8">
        {renderTabContent()}
      </div>

      {/* AI Chatbot */}
      <div className="fixed bottom-4 right-4 lg:bottom-6 lg:right-6 z-50">
        {!showChatbot ? (
          <button
            onClick={() => setShowChatbot(true)}
            className="bg-blue-600 text-white rounded-2xl p-3 lg:p-4 shadow-xl hover:bg-blue-700 transition-all duration-200 hover:scale-105"
          >
            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-72 lg:w-80 h-80 lg:h-96 flex flex-col border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="font-semibold">ผู้ช่วย AI</h3>
              <button
                onClick={() => setShowChatbot(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  <p>สวัสดี! ฉันอยู่ที่นี่เพื่อช่วยตอบคำถามเกี่ยวกับสุขภาพปลา</p>
                  <p>ถามฉันเกี่ยวกับอาการ โรค หรือปลาแม่น้ำโขง!</p>
                </div>
              )}
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-2 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="ถามเกี่ยวกับสุขภาพปลา..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  ส่ง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
