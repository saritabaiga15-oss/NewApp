import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import QRCodeSvg from "./QRCodeSvg";
import { Palette } from "@/constants/theme";

interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  appUrl?: string;
  initialTab?: "show" | "scan";
}

export default function QrCodeModal({
  visible,
  onClose,
  appUrl = "https://onodem.com",
  initialTab = "show",
}: QrCodeModalProps) {
  const [activeTab, setActiveTab] = useState<"show" | "scan">(initialTab);
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);
  const fileInputRef = useRef<any>(null);

  // Laser scan line animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      setScanResult(null);
      setCameraError(null);
      if (initialTab === "scan") {
        startCamera();
      }
    } else {
      stopCameraTracks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, initialTab]);

  // Laser sweep animation loop
  useEffect(() => {
    if (cameraActive) {
      const sweep = Animated.loop(
        Animated.sequence([
          Animated.timing(laserAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(laserAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      sweep.start();
      return () => sweep.stop();
    }
  }, [cameraActive, laserAnim]);

  const stopCameraTracks = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleScanDetected = (decodedText: string) => {
    setScanResult(decodedText);
    stopCameraTracks();

    // Auto navigate if it's an app URL or path
    setTimeout(() => {
      onClose();
      if (decodedText.includes("/memory-wall")) {
        router.push("/memory-wall");
      } else if (decodedText.includes("/discover")) {
        router.push("/discover");
      } else if (decodedText.includes("/create")) {
        router.push("/create");
      } else if (decodedText.includes("/home")) {
        router.push("/home");
      } else if (decodedText.startsWith("http")) {
        if (Platform.OS === "web" && typeof window !== "undefined") {
          window.location.href = decodedText;
        }
      } else {
        router.push("/home");
      }
    }, 900);
  };

  const startScanningLoop = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    // Check for native BarcodeDetector API support
    const hasBarcodeDetector = "BarcodeDetector" in window;
    if (hasBarcodeDetector) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code) {
                  handleScanDetected(code);
                }
              }
            } catch {
              // frame detection pass
            }
          }
        }, 300);
      } catch {
        // BarcodeDetector initialization fallback
      }
    }
  };

  const startCamera = async () => {
    if (Platform.OS !== "web") return;
    try {
      setCameraError(null);
      setScanResult(null);
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        startScanningLoop();
      } else {
        setCameraError("Camera is not supported on this browser.");
      }
    } catch {
      setCameraError("Camera permission denied. Please allow camera access in your browser bar.");
      setCameraActive(false);
    }
  };

  const handleTabChange = (tab: "show" | "scan") => {
    if (tab === "scan") {
      setActiveTab("scan");
      startCamera();
    } else {
      stopCameraTracks();
      setActiveTab("show");
    }
  };

  const handleClose = () => {
    stopCameraTracks();
    onClose();
  };

  const handleCopy = async () => {
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(appUrl);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileUpload = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (Platform.OS === "web" && typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const imageBitmap = await createImageBitmap(file);
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleScanDetected(barcodes[0].rawValue);
          return;
        }
      } catch {
        // detection failed
      }
    }
    // Fallback if no code detected or BarcodeDetector not available
    setScanResult(`Image loaded: ${file.name}`);
  };

  const translateY = laserAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 190],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.brandIcon}>
                <Ionicons name="qr-code" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Mobile App Access</Text>
                <Text style={styles.headerSubtitle}>Honour Your Mentor on any device</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} accessibilityLabel="Close modal">
              <Ionicons name="close" size={22} color="#A1A1AA" />
            </TouchableOpacity>
          </View>

          {/* High-Contrast Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "show" && styles.tabActive]}
              onPress={() => handleTabChange("show")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={activeTab === "show" ? "#09090B" : "#A1A1AA"}
              />
              <Text style={[styles.tabText, activeTab === "show" && styles.tabTextActive]}>
                Scan with Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "scan" && styles.tabActive]}
              onPress={() => handleTabChange("scan")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="scan-outline"
                size={16}
                color={activeTab === "scan" ? "#09090B" : "#A1A1AA"}
              />
              <Text style={[styles.tabText, activeTab === "scan" && styles.tabTextActive]}>
                Camera Scanner
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeTab === "show" ? (
              // TAB 1: SHOW HIGH-CONTRAST QR CODE TO INSTALL / OPEN
              <View style={styles.tabContent}>
                <Text style={styles.instruction}>
                  Scan this QR code with your phone camera to open and install{"\n"}
                  <Text style={styles.brandHighlight}>Honour Your Mentor</Text> on your phone.
                </Text>

                {/* High Contrast Jet Black on Pure White QR Code Card */}
                <View style={styles.qrWrapper}>
                  <QRCodeSvg value={appUrl} size={210} color="#000000" backgroundColor="#FFFFFF" />
                </View>

                {/* URL Chip & Copy Button */}
                <View style={styles.urlChip}>
                  <Ionicons name="link-outline" size={16} color="#A1A1AA" />
                  <Text style={styles.urlText} numberOfLines={1}>
                    {appUrl}
                  </Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
                    <Ionicons
                      name={copied ? "checkmark-circle" : "copy-outline"}
                      size={14}
                      color={copied ? "#34D399" : "#09090B"}
                    />
                    <Text style={styles.copyBtnText}>{copied ? "Copied!" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Step-by-step PWA install guide */}
                <View style={styles.guideContainer}>
                  <Text style={styles.guideTitle}>How to install as an App (PWA):</Text>
                  <View style={styles.stepRow}>
                    <Ionicons name="logo-apple" size={17} color="#FFFFFF" style={styles.stepIcon} />
                    <Text style={styles.stepText}>
                      <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>iPhone/iPad:</Text> Point Camera at code → Open in Safari → Tap Share <Ionicons name="share-outline" size={12} color="#FFFFFF" /> → Tap <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>&quot;Add to Home Screen&quot;</Text>
                    </Text>
                  </View>
                  <View style={styles.stepRow}>
                    <Ionicons name="logo-android" size={17} color="#34D399" style={styles.stepIcon} />
                    <Text style={styles.stepText}>
                      <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>Android:</Text> Point Camera / Google Lens → Open in Chrome → Tap <Text style={{ fontWeight: "700", color: "#FFFFFF" }}>&quot;Install App&quot;</Text> or Menu <Ionicons name="ellipsis-vertical" size={12} color="#FFFFFF" /> → &quot;Add to Home screen&quot;
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // TAB 2: LIVE CAMERA SCANNER
              <View style={styles.tabContent}>
                <Text style={styles.instruction}>
                  Point your camera at a Mentor Card or Tribute QR code to open it instantly.
                </Text>

                {/* Camera Viewport */}
                <View style={styles.scannerBox}>
                  {Platform.OS === "web" && (
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{
                        width: "100%",
                        height: 220,
                        objectFit: "cover",
                        borderRadius: 14,
                        backgroundColor: "#09090B",
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                  )}

                  {!cameraActive && (
                    <View style={styles.scannerPlaceholder}>
                      <View style={styles.cameraIconHalo}>
                        <Ionicons name="camera-outline" size={36} color="#FFFFFF" />
                      </View>
                      <Text style={styles.cameraPlaceholderText}>
                        {cameraError || "Ready to scan QR codes with your webcam or camera."}
                      </Text>
                      <TouchableOpacity style={styles.startCameraBtn} onPress={startCamera} activeOpacity={0.85}>
                        <Ionicons name="videocam" size={16} color="#09090B" />
                        <Text style={styles.startCameraBtnText}>Start Camera Scanner</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {cameraActive && (
                    <>
                      {/* Targeting Corners */}
                      <View style={styles.viewfinderFrame}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                      </View>

                      {/* Animated Neon Laser Bar */}
                      <Animated.View
                        style={[
                          styles.laserLine,
                          {
                            transform: [{ translateY }],
                          },
                        ]}
                      />
                    </>
                  )}
                </View>

                {scanResult && (
                  <View style={styles.scanSuccessBanner}>
                    <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                    <Text style={styles.scanSuccessText} numberOfLines={1}>
                      Found: {scanResult}
                    </Text>
                  </View>
                )}

                {cameraActive ? (
                  <TouchableOpacity style={styles.stopCameraBtn} onPress={stopCameraTracks} activeOpacity={0.8}>
                    <Ionicons name="stop-circle-outline" size={16} color="#F87171" />
                    <Text style={styles.stopCameraBtnText}>Stop Camera</Text>
                  </TouchableOpacity>
                ) : (
                  // File upload fallback if webcam is blocked or user has an image
                  Platform.OS === "web" && (
                    <View style={styles.uploadRow}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={() => fileInputRef.current?.click()}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="image-outline" size={15} color="#A1A1AA" />
                        <Text style={styles.uploadBtnText}>Upload QR Image from Computer</Text>
                      </TouchableOpacity>
                    </View>
                  )
                )}

                {/* Quick Shortcuts */}
                <View style={styles.demoScanRow}>
                  <Text style={styles.demoScanTitle}>Or jump directly to:</Text>
                  <View style={styles.demoButtons}>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => {
                        onClose();
                        router.push("/memory-wall");
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="images-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.demoBtnText}>Memory Wall</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => {
                        onClose();
                        router.push("/discover");
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="compass-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.demoBtnText}>Discover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#18181B", // Zinc-900 Dark Surface
    borderRadius: 24,
    width: "100%",
    maxWidth: 440,
    maxHeight: "92%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#27272A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#71717A",
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#121215",
    borderBottomWidth: 1,
    borderBottomColor: "#27272A",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#27272A",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A1A1AA",
  },
  tabTextActive: {
    color: "#09090B",
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  tabContent: {
    alignItems: "center",
  },
  instruction: {
    fontSize: 13,
    color: "#D4D4D8",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  brandHighlight: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: "#FFFFFF", // High contrast white container
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  urlChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    width: "100%",
    gap: 8,
    marginBottom: 16,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: "#F4F4F5",
    fontWeight: "500",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#09090B",
  },
  guideContainer: {
    width: "100%",
    backgroundColor: "#222225",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2E2E33",
  },
  guideTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A1A1AA",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 6,
  },
  stepIcon: {
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: "#D4D4D8",
    lineHeight: 18,
  },
  scannerBox: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#09090B",
    borderWidth: 1,
    borderColor: "#27272A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cameraIconHalo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#27272A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cameraPlaceholderText: {
    color: "#A1A1AA",
    fontSize: 12.5,
    marginBottom: 16,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
  startCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startCameraBtnText: {
    color: "#09090B",
    fontSize: 13,
    fontWeight: "700",
  },
  stopCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    marginBottom: 12,
  },
  stopCameraBtnText: {
    color: "#F87171",
    fontSize: 12,
    fontWeight: "600",
  },
  scanSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(52, 211, 153, 0.14)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
    width: "100%",
  },
  scanSuccessText: {
    flex: 1,
    fontSize: 12,
    color: "#34D399",
    fontWeight: "600",
  },
  uploadRow: {
    marginBottom: 14,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#27272A",
  },
  uploadBtnText: {
    fontSize: 12,
    color: "#D4D4D8",
  },
  viewfinderFrame: {
    position: "absolute",
    width: 150,
    height: 150,
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#34D399", // Neon Emerald Target
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  laserLine: {
    position: "absolute",
    left: "15%",
    right: "15%",
    height: 2,
    backgroundColor: "#34D399",
    shadowColor: "#34D399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    pointerEvents: "none",
  },
  demoScanRow: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  demoScanTitle: {
    fontSize: 12,
    color: "#71717A",
  },
  demoButtons: {
    flexDirection: "row",
    gap: 10,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#27272A",
    borderWidth: 1,
    borderColor: "#3F3F46",
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
