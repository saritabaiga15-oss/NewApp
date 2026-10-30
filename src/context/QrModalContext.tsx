import React, { createContext, useContext, useState, ReactNode } from "react";
import QrCodeModal from "@/components/web/QrCodeModal";

interface QrModalContextValue {
  openQrModal: (url?: string) => void;
  closeQrModal: () => void;
  isQrModalVisible: boolean;
}

const QrModalContext = createContext<QrModalContextValue>({
  openQrModal: () => {},
  closeQrModal: () => {},
  isQrModalVisible: false,
});

export function QrModalProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [modalUrl, setModalUrl] = useState("https://onodem.com");

  const openQrModal = (url?: string) => {
    if (url) setModalUrl(url);
    setVisible(true);
  };

  const closeQrModal = () => {
    setVisible(false);
  };

  return (
    <QrModalContext.Provider value={{ openQrModal, closeQrModal, isQrModalVisible: visible }}>
      {children}
      <QrCodeModal visible={visible} onClose={closeQrModal} appUrl={modalUrl} />
    </QrModalContext.Provider>
  );
}

export function useQrModal() {
  return useContext(QrModalContext);
}

