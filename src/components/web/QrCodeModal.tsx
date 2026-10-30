import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import QRCodeSvg from "./QRCodeSvg";
import { Palette } from "@/constants/theme";

interface QrCodeModalProps {
  visible: boolean;
  onClose: () => void;
  appUrl?: string;
}

export default function QrCodeModal({
  visible,
  onClose,
  appUrl = "https://onodem.com",
}: QrCodeModalProps) {
  const [activeTab, setActiveTab] = useState<"show" | "scan">("show");
  const [copied, setCopied] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<any>(null);
  const streamRef = useRef<any>(null);

  const stopCameraTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: any) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    if (Platform.OS !== "web") return;
    try {
      setCameraError(null);
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } else {
        setCameraError("Camera access is not supported on this browser.");
      }
    } catch {
      setCameraError("Camera permission was denied or camera is unavailable.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track: any) => track.stop());
        streamRef.current = null;
      }
    };
  }, [visible]);

  const handleTabChange = (tab: "show" | "scan") => {
    if (tab !== "scan") {
      stopCameraTracks();
    }
    setActiveTab(tab);
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

  const handleDemoScanSuccess = (destinationUrl: string) => {
    stopCameraTracks();
    onClose();
    if (destinationUrl.includes("/memory-wall")) {
      router.push("/memory-wall");
    } else if (destinationUrl.includes("/discover")) {
      router.push("/discover");
    } else {
      router.push("/home");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.brandIcon}>
                <Ionicons name="qr-code" size={20} color={Palette.oceanTeal} />
              </View>
              <Text style={styles.title}>Mobile App Access</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} accessibilityLabel="Close modal">
              <Ionicons name="close" size={22} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "show" && styles.tabActive]}
              onPress={() => handleTabChange("show")}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={activeTab === "show" ? Palette.oceanTeal : Palette.textMuted}
              />
              <Text style={[styles.tabText, activeTab === "show" && styles.tabTextActive]}>
                Scan with Phone
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "scan" && styles.tabActive]}
              onPress={() => handleTabChange("scan")}
            >
              <Ionicons
                name="scan-outline"
                size={16}
                color={activeTab === "scan" ? Palette.oceanTeal : Palette.textMuted}
              />
              <Text style={[styles.tabText, activeTab === "scan" && styles.tabTextActive]}>
                Camera Scanner
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {activeTab === "show" ? (
              // TAB 1: SHOW QR CODE TO INSTALL / OPEN
              <View style={styles.tabContent}>
                <Text style={styles.instruction}>
                  Scan this QR code with your mobile camera to open and install{" "}
                  <Text style={{ fontWeight: "700", color: Palette.oceanTeal }}>Honour Your Mentor</Text> on your phone.
                </Text>

                {/* Vector QR Code */}
                <View style={styles.qrWrapper}>
                  <QRCodeSvg value={appUrl} size={210} color={Palette.oceanTeal} backgroundColor="#FFFFFF" />
                </View>

                {/* URL Chip & Copy Button */}
                <View style={styles.urlChip}>
                  <Ionicons name="link-outline" size={16} color={Palette.textSecondary} />
                  <Text style={styles.urlText} numberOfLines={1}>
                    {appUrl}
                  </Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
                    <Ionicons
                      name={copied ? "checkmark-circle" : "copy-outline"}
                      size={15}
                      color={copied ? Palette.accentMint : "#FFFFFF"}
                    />
                    <Text style={styles.copyBtnText}>{copied ? "Copied!" : "Copy"}</Text>
                  </TouchableOpacity>
                </View>

                {/* Step by step install guide */}
                <View style={styles.guideContainer}>
                  <Text style={styles.guideTitle}>How to install as an App (PWA):</Text>
                  <View style={styles.stepRow}>
                    <Ionicons name="logo-apple" size={18} color={Palette.textPrimary} style={styles.stepIcon} />
                    <Text style={styles.stepText}>
                      <Text style={{ fontWeight: "700" }}>iPhone/iPad:</Text> Point Camera at code → Open in Safari → Tap Share <Ionicons name="share-outline" size={12} /> → Tap <Text style={{ fontWeight: "700" }}>&quot;Add to Home Screen&quot;</Text>
                    </Text>
                  </View>
                  <View style={styles.stepRow}>
                    <Ionicons name="logo-android" size={18} color="#3DDC84" style={styles.stepIcon} />
                    <Text style={styles.stepText}>
                      <Text style={{ fontWeight: "700" }}>Android:</Text> Point Camera / Google Lens → Open in Chrome → Tap <Text style={{ fontWeight: "700" }}>&quot;Install App&quot;</Text> or Menu <Ionicons name="ellipsis-vertical" size={12} /> → &quot;Add to Home screen&quot;
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // TAB 2: LIVE CAMERA SCANNER
              <View style={styles.tabContent}>
                <Text style={styles.instruction}>
                  Point your camera at a Mentor Card or Tribute QR code to view it instantly.
                </Text>

                {/* Camera Viewport (Web Native) */}
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
                        borderRadius: 12,
                        backgroundColor: "#0F172A",
                        display: cameraActive ? "block" : "none",
                      }}
                    />
                  )}

                  {!cameraActive && (
                    <View style={styles.scannerPlaceholder}>
                      <Ionicons name="camera-reverse-outline" size={44} color={Palette.textMuted} />
                      <Text style={styles.cameraPlaceholderText}>
                        {cameraError || "Camera scanner is ready."}
                      </Text>
                      <TouchableOpacity style={styles.startCameraBtn} onPress={startCamera} activeOpacity={0.85}>
                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                        <Text style={styles.startCameraBtnText}>Open Camera Scanner</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {cameraActive && (
                    <View style={styles.viewfinderFrame}>
                      <View style={[styles.corner, styles.cornerTL]} />
                      <View style={[styles.corner, styles.cornerTR]} />
                      <View style={[styles.corner, styles.cornerBL]} />
                      <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                  )}
                </View>

                {cameraActive && (
                  <TouchableOpacity style={styles.stopCameraBtn} onPress={stopCameraTracks}>
                    <Ionicons name="stop-circle-outline" size={16} color={Palette.accentCoral} />
                    <Text style={styles.stopCameraBtnText}>Stop Camera</Text>
                  </TouchableOpacity>
                )}

                {/* Quick Test / Scan Simulation */}
                <View style={styles.demoScanRow}>
                  <Text style={styles.demoScanTitle}>Or open directly:</Text>
                  <View style={styles.demoButtons}>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => handleDemoScanSuccess("/memory-wall")}
                    >
                      <Ionicons name="images-outline" size={14} color={Palette.oceanTeal} />
                      <Text style={styles.demoBtnText}>Memory Wall</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.demoBtn}
                      onPress={() => handleDemoScanSuccess("/discover")}
                    >
                      <Ionicons name="compass-outline" size={14} color={Palette.oceanTeal} />
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
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 460,
    maxHeight: "90%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  tabTextActive: {
    color: Palette.oceanTeal,
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
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  urlChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    width: "100%",
    gap: 8,
    marginBottom: 18,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    color: Palette.textPrimary,
    fontWeight: "500",
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  guideContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  guideTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    color: Palette.textSecondary,
    lineHeight: 17,
  },
  scannerBox: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cameraPlaceholderText: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 10,
    marginBottom: 14,
    textAlign: "center",
  },
  startCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startCameraBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  stopCameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  stopCameraBtnText: {
    color: Palette.accentCoral,
    fontSize: 12,
    fontWeight: "600",
  },
  viewfinderFrame: {
    position: "absolute",
    width: 140,
    height: 140,
    pointerEvents: "none",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: Palette.accentMint,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  demoScanRow: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  demoScanTitle: {
    fontSize: 12,
    color: Palette.textMuted,
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
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
});
