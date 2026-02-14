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

  // ✅ Download as proper office-style form PDF (no html2canvas — pure jsPDF)
  const handleDownloadPDF = async () => {
    if (!data) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const marginL = 14;
      const marginR = 14;
      const contentW = pageW - marginL - marginR;
      let y = 16;

      const checkPage = (needed) => {
        if (y + needed > pageH - 14) {
          pdf.addPage();
          y = 14;
        }
      };

      // --- Title ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("FARMER SURVEY REPORT", pageW / 2, y, { align: "center" });
      y += 10;

      // --- Helper: draw a bordered row with label & value ---
      const drawRow = (label, value, rowH = 9) => {
        checkPage(rowH);
        const halfW = contentW / 2;
        // label cell
        pdf.setDrawColor(180);
        pdf.rect(marginL, y, halfW, rowH);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(80);
        pdf.text(label, marginL + 3, y + 6);
        // value cell
        pdf.rect(marginL + halfW, y, halfW, rowH);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(30);
        const valText = String(value || "N/A");
        pdf.text(valText, marginL + halfW + 3, y + 6);
        y += rowH;
      };

      // --- Helper: draw a full-width row ---
      const drawFullRow = (label, value, rowH = 9) => {
        checkPage(rowH);
        const labelW = contentW * 0.3;
        const valW = contentW * 0.7;
        pdf.setDrawColor(180);
        pdf.rect(marginL, y, labelW, rowH);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(80);
        pdf.text(label, marginL + 3, y + 6);
        pdf.rect(marginL + labelW, y, valW, rowH);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(30);
        pdf.text(String(value || "N/A"), marginL + labelW + 3, y + 6);
        y += rowH;
      };

      // --- Helper: section heading ---
      const drawSectionHeading = (title) => {
        checkPage(14);
        y += 4;
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(30);
        pdf.text(title, marginL, y);
        y += 2;
        pdf.setDrawColor(30);
        pdf.setLineWidth(0.5);
        pdf.line(marginL, y, marginL + contentW, y);
        y += 5;
      };

      // === HEADER INFO ===
      drawSectionHeading("General Information");
      drawRow("Form Number", data?.formNumber);
      drawRow("Feedback ID", data?.surveyId || "New");
      drawRow("Status", data?.formStatus);

      // === FARMER INFORMATION ===
      drawSectionHeading("Farmer Information");
      drawRow("Name", data?.farmerName);
      drawRow("User ID", data?.userId);
      drawRow("Phone Number", data?.farmerMobile);
      drawRow("Taluka", data?.taluka);
      drawRow("District", data?.district);
      drawFullRow("Address", data?.address);

      // === SURVEY DETAILS ===
      drawSectionHeading("Survey Details");
      drawRow("Survey Type", "Survey");
      drawRow("Submitted On",
        data?.farmerSelfie?.takenAt
          ? new Date(data.farmerSelfie.takenAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
          })
          : "N/A"
      );

      if (data?.farmInformation) {
        drawFullRow("Farm Information", data.farmInformation);
      }

      // === FARM DETAILS ===
      drawSectionHeading("Farm Details");
      drawRow("Land Area", data?.landArea);
      drawRow("Sample Collected", data?.sampleCollected ? "Yes" : "No");

      if (data?.cropDetails && data.cropDetails.length > 0) {
        drawFullRow("Crops Grown", data.cropDetails.join(", "));
      }
      if (data?.livestockDetails && data.livestockDetails.length > 0) {
        drawFullRow("Livestock", data.livestockDetails.join(", "));
      }
      if (data?.productionEquipment && data.productionEquipment.length > 0) {
        drawFullRow("Equipment", data.productionEquipment.join(", "));
      }

      // === FARMER SELFIE ===
      if (data?.farmerSelfie?.imageUrl) {
        drawSectionHeading("Farmer Photograph");
        checkPage(60);

        const imgW = 40;
        const imgH = 50;
        const imgX = (pageW - imgW) / 2;

        // border around photo
        pdf.setDrawColor(120);
        pdf.setLineWidth(0.4);
        pdf.rect(imgX - 1, y - 1, imgW + 2, imgH + 2);

        try {
          const imgSrc = `data:image/jpeg;base64,${data.farmerSelfie.imageUrl}`;
          pdf.addImage(imgSrc, "JPEG", imgX, y, imgW, imgH);
        } catch (e) {
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          pdf.text("(Photo unavailable)", pageW / 2, y + imgH / 2, { align: "center" });
        }

        y += imgH + 4;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text("Farmer Selfie", pageW / 2, y, { align: "center" });
        y += 6;
      }

      // --- Footer ---
      checkPage(12);
      y += 6;
      pdf.setDrawColor(180);
      pdf.setLineWidth(0.3);
      pdf.line(marginL, y, marginL + contentW, y);
      y += 5;
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(140);
      pdf.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, marginL, y);
      pdf.text(`Form #${data?.formNumber || "N/A"}`, marginL + contentW, y, { align: "right" });

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
              <div className="subsection-group">
                <div className="subsection-label">Crops Grown</div>
                <div className="list-items">
                  {data.cropDetails.map((crop, index) => (
                    <span key={index} className="list-tag">🌱 {crop}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.livestockDetails && data.livestockDetails.length > 0 && (
              <div className="subsection-group">
                <div className="subsection-label">Livestock</div>
                <div className="list-items">
                  {data.livestockDetails.map((animal, index) => (
                    <span key={index} className="list-tag">🐄 {animal}</span>
                  ))}
                </div>
              </div>
            )}

            {data?.productionEquipment && data.productionEquipment.length > 0 && (
              <div className="subsection-group">
                <div className="subsection-label">Equipment</div>
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
                  <button className="btn-download-image no-print" onClick={handleDownloadImage}>
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
