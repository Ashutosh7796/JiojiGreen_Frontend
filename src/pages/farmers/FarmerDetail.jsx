import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "../../hooks/useToast";
import { BASE_URL } from '../../config/api';
import "./FarmersDetails.css";



const getToken = () => localStorage.getItem("token");

const FarmerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ref for PDF download
  const pdfRef = useRef(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/v1/employeeFarmerSurveys/${id}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );

        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  // ✅ Download Whole Form as PDF
  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;

    try {
      const element = pdfRef.current;

      // Capture full content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // multiple pages if content is large
      while (heightLeft > 0) {
        position = position - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Survey-${data?.formNumber || id || "Details"}.pdf`);
    } catch (error) {
      console.error("PDF Download Error:", error);
      showToast("Failed to download PDF. Please try again.", "error");
    }
  };

  // ✅ Download base64 image properly
  const handleDownloadImage = () => {
    if (!data?.farmerSelfie?.imageUrl) return;

    try {
      const base64Data = data.farmerSelfie.imageUrl;

      const link = document.createElement("a");
      link.href = `data:image/jpeg;base64,${base64Data}`;
      link.download = `FarmerSelfie-${data?.farmerName || "Image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Image Download Error:", error);
      showToast("Failed to download image.", "error");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="detail-page-wrapper">
      {/* TOP ACTION BAR */}
      <div className="detail-actions-bar">
        <button className="back-button" onClick={() => navigate("/admin/farmers")}>
          ← Back to Farmers
        </button>
        <div className="action-buttons">
          <button className="btn-download" onClick={handleDownloadPDF}>
            📄 Download PDF
          </button>
        </div>
      </div>

      {/* WRAP FULL FORM IN REF */}
      <div ref={pdfRef}>
        {/* HEADER CARD */}
        <div className="detail-header">
          <h3 className="title-main">
            📋 Survey Details
          </h3>
          <div className="header-meta">
            <div className="meta-card">
              <div className="meta-label">Form Number</div>
              <div className="meta-value">{data?.formNumber || "N/A"}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Feedback ID</div>
              <div className="meta-value">{data?.surveyId || "New"}</div>
            </div>
            <div className="meta-card">
              <div className="meta-label">Status</div>
              <div className="status-badge">{data?.formStatus || "N/A"}</div>
            </div>
          </div>
        </div>

        {/* CONTENT WRAPPER */}
        <div className="detail-content">
          {/* FARMER INFORMATION */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon">👤</div>
              <h4 className="section-title">Farmer Information</h4>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Name</div>
                <div className="info-value">{data?.farmerName || "N/A"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">User ID</div>
                <div className="info-value">{data?.userId || "N/A"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Phone Number</div>
                <div className="info-value">{data?.farmerMobile || "N/A"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Taluka</div>
                <div className="info-value">{data?.taluka || "N/A"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">District</div>
                <div className="info-value">{data?.district || "N/A"}</div>
              </div>
              <div className="info-card full-width">
                <div className="info-label">Address</div>
                <div className="info-value">{data?.address || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* SURVEY DETAILS */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon">📝</div>
              <h4 className="section-title">Survey Details</h4>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Survey Type</div>
                <div className="info-value">Survey</div>
              </div>
              <div className="info-card">
                <div className="info-label">Submitted On</div>
                <div className="info-value">
                  {data?.farmerSelfie?.takenAt
                    ? new Date(data.farmerSelfie.takenAt).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )
                    : "N/A"}
                </div>
              </div>
            </div>

            {data?.farmInformation && (
              <div className="detail-message-box">
                <div className="message-label">Farm Information</div>
                <div className="message-content">"{data.farmInformation}"</div>
              </div>
            )}
          </div>

          {/* FARM DETAILS */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon">🌾</div>
              <h4 className="section-title">Farm Details</h4>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Land Area</div>
                <div className="info-value">{data?.landArea || "N/A"}</div>
              </div>
              <div className="info-card">
                <div className="info-label">Sample Collected</div>
                <div className="info-value">{data?.sampleCollected ? "Yes" : "No"}</div>
              </div>
            </div>

            {data?.cropDetails && data.cropDetails.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div className="info-label" style={{ marginBottom: "10px" }}>Crops Grown</div>
                <div className="list-items">
                  {data.cropDetails.map((crop, index) => (
                    <span key={index} className="list-tag">🌱 {crop}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.livestockDetails && data.livestockDetails.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div className="info-label" style={{ marginBottom: "10px" }}>Livestock</div>
                <div className="list-items">
                  {data.livestockDetails.map((animal, index) => (
                    <span key={index} className="list-tag">🐄 {animal}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.productionEquipment && data.productionEquipment.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <div className="info-label" style={{ marginBottom: "10px" }}>Equipment</div>
                <div className="list-items">
                  {data.productionEquipment.map((equipment, index) => (
                    <span key={index} className="list-tag">🚜 {equipment}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ATTACHMENTS */}
          <div className="detail-section">
            <div className="section-header">
              <div className="section-icon">📎</div>
              <h4 className="section-title">Attachments</h4>
            </div>

            {data?.farmerSelfie?.imageUrl ? (
              <div className="attachment-grid">
                <div className="attachment-card">
                  <div className="img-preview">
                    <img
                      src={`data:image/jpeg;base64,${data.farmerSelfie.imageUrl}`}
                      alt="Farmer Selfie"
                    />
                  </div>
                  <span className="file-label">Farmer Selfie</span>
                  <button className="btn-download-image" onClick={handleDownloadImage}>
                    Download Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-attachments">
                📁 No attachments available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastComponent />
    </div>
  );
};

export default FarmerDetail;
