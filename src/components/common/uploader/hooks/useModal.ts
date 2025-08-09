import { useState, useCallback } from "react";

export const useModal = (initialState: boolean = false) => {
  const [isModalOpen, setIsModalOpen] = useState(initialState);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen((prev) => !prev);
  }, []);

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsModalOpen,
  };
};
