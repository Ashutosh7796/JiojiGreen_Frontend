import React, { useState, useRef } from "react";
import "./FarmerRegistration.css";
import { useEffect } from "react";
import { useToast } from "../../../hooks/useToast";

// const API_BASE_URL = "https://jiojibackendv1-production.up.railway.app";
const API_BASE_URL = "http://localhost:8080";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function FarmerRegistration({
  isEdit = false,
  initialData = {},
  autoAcceptTerms = false,
  scrollToSelfie = false,
  onSuccess,
}) {
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    // Mobile-only hard reset scroll (iOS + Android safe)
    if (window.matchMedia("(max-width: 768px)").matches) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    }
  }, []);

  useEffect(() => {
    // Disable browser scroll restoration
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const scrollToTopEverywhere = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;

        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight
        ) {
          el.scrollTop = 0;
        }
      });
    };

    scrollToTopEverywhere();

    requestAnimationFrame(() => {
      scrollToTopEverywhere();
    });

    const timer = setTimeout(() => {
      scrollToTopEverywhere();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const [formData, setFormData] = useState({
    farmerName: initialData.farmerName || "",
    mobileNumber: initialData.farmerMobile || "",
    alternateMobile: initialData.alternateMobile || "",
    place: initialData.address?.split(",")[0]?.trim() || "",
    village: initialData.village || "",
    taluka: initialData.taluka || "",
    district: initialData.district || "",
    farmingType: initialData.farmInformation || "",
    crops: initialData.cropDetails || [],
    livestock: initialData.livestockDetails || [],
    equipment: initialData.productionEquipment?.[0]?.toLowerCase() || "",
    membershipFee: "250",
    termsAccepted: isEdit || autoAcceptTerms,
    selfieFile: null,
    selfiePreview: null,
    signatureFile: null,
    signaturePreview: null,
  });

  const [surveyId, setSurveyId] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Basic validation
      if (!formData.farmerName.trim()) {
        showToast("Please enter Farmer's Name", "error");
        return;
      }

      if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
        showToast("Please enter a valid 10-digit Mobile Number", "error");
        return;
      }

      if (!formData.village.trim()) {
        showToast("Please enter Village", "error");
        return;
      }

      if (!formData.termsAccepted) {
        showToast("Please accept terms & conditions", "error");
        return;
      }

      // API call would go here
      showToast("Survey submitted successfully!", "success");
      setShowSuccessModal(true);
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 800);
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1 className="form-title">Fill Farmer Survey Forms</h1>
        </div>

        <div className="form-content">
          {/* Farmer Details */}
          <section className="form-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span> Farmer Details
            </h2>
            <div className="grid-2-col">
              <div className="form-group">
                <label className="form-label">
                  Farmer's Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="farmerName"
                  value={formData.farmerName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Mobile Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="10 digit number"
                  maxLength="10"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group full-width">
                <label className="form-label">
                  Village <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleInputChange}
                  placeholder="Enter village name"
                  className="form-input"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </section>

          {/* Terms */}
          <section className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                className="checkbox-input"
                disabled={isSubmitting}
              />
              <span className="checkbox-text">I accept the terms & conditions</span>
            </label>
          </section>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              type="button"
              onClick={handleSubmit}
              className={`btn btn-primary ${
                !formData.termsAccepted || isSubmitting ? "btn-disabled" : ""
              }`}
              disabled={!formData.termsAccepted || isSubmitting}
            >
              {isSubmitting ? "SUBMITTING..." : "SAVE DATA"}
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="success-icon">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle
                  className="checkmark-circle"
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                />
                <path
                  className="checkmark-check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <h2 className="modal-title">Survey Submitted!</h2>
            <p className="modal-message">
              Thank you{" "}
              <span className="highlight-name">{formData.farmerName}</span> for
              completing the survey.
            </p>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
}
