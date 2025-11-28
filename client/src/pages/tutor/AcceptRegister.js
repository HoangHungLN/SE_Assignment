// client/src/pages/tutor/AcceptRegister.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../../components/MainLayout";
import Button from "../../components/button";
import "./AcceptRegister.css";

// TODO: chỉnh lại BASE URL cho đúng config server của bạn
const API_BASE = "http://localhost:5000/api/groups";

// TODO: tạm thời hard-code tutor hiện tại, sau này lấy từ token / context
const CURRENT_TUTOR_ID = "T001";

const AcceptRegister = () => {
  const [requestedGroups, setRequestedGroups] = useState([]); // cột trái
  const [unassignedGroups, setUnassignedGroups] = useState([]); // cột phải
  const [acceptedGroups, setAcceptedGroups] = useState([]); // panel dưới

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // "requested" | "accepted" | "unassigned"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Phân trang
  const [requestedPage, setRequestedPage] = useState(1);
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [acceptedPage, setAcceptedPage] = useState(1);

  // Số card mỗi trang:
  // - Cột trái: 2 hàng x 1 card  => 2 card/trang
  // - Cột phải: 2 hàng x 3 card => 6 card/trang
  // - Panel dưới: 2 hàng x 4 card => 8 card/trang
  const REQUESTED_PER_PAGE = 2;
  const UNASSIGNED_PER_PAGE = 4;
  const ACCEPTED_PER_PAGE = 8;

  const requestedTotalPages = Math.max(
    1,
    Math.ceil(requestedGroups.length / REQUESTED_PER_PAGE)
  );
  const unassignedTotalPages = Math.max(
    1,
    Math.ceil(unassignedGroups.length / UNASSIGNED_PER_PAGE)
  );
  const acceptedTotalPages = Math.max(
    1,
    Math.ceil(acceptedGroups.length / ACCEPTED_PER_PAGE)
  );

  const paginatedRequested = requestedGroups.slice(
    (requestedPage - 1) * REQUESTED_PER_PAGE,
    requestedPage * REQUESTED_PER_PAGE
  );
  const paginatedUnassigned = unassignedGroups.slice(
    (unassignedPage - 1) * UNASSIGNED_PER_PAGE,
    unassignedPage * UNASSIGNED_PER_PAGE
  );
  const paginatedAccepted = acceptedGroups.slice(
    (acceptedPage - 1) * ACCEPTED_PER_PAGE,
    acceptedPage * ACCEPTED_PER_PAGE
  );

  const changeRequestedPage = (delta) => {
    setRequestedPage((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > requestedTotalPages) return requestedTotalPages;
      return next;
    });
  };

  const changeUnassignedPage = (delta) => {
    setUnassignedPage((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > unassignedTotalPages) return unassignedTotalPages;
      return next;
    });
  };

  const changeAcceptedPage = (delta) => {
    setAcceptedPage((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > acceptedTotalPages) return acceptedTotalPages;
      return next;
    });
  };

  // Helper format datetime
  const formatDateTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value; // fallback nếu không phải ISO
    return d.toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const mapCreatorName = (group) => {
    const c = group.creatorStudent || {};
    return c.name || c.fullName || c.studentName || c.studentID || "Không rõ";
  };

  const mapCreatorMSSV = (group) => {
    const c = group.creatorStudent || {};
    return c.studentID || "";
  };

  // Load toàn bộ group rồi lọc theo tutor & status
  const loadGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API_BASE}/search`, {});
      if (!res.data || !res.data.success) {
        setRequestedGroups([]);
        setUnassignedGroups([]);
        setAcceptedGroups([]);
        setRequestedPage(1);
        setUnassignedPage(1);
        setAcceptedPage(1);
        setError(res.data?.message || "Không tải được danh sách nhóm.");
        return;
      }

      const groups = res.data.data || [];

      const requested = [];
      const unassigned = [];
      const accepted = [];

      groups.forEach((g) => {
        const tutor = g.tutor || null;
        const tutorID = tutor?.tutorID;

        // CỘT TRÁI: nhóm đã request chính tutor, đang chờ quyết định
        if (tutor && tutorID === CURRENT_TUTOR_ID && g.status === "waiting") {
          requested.push(g);
        }

        // PANEL DƯỚI: nhóm đã được chính tutor tiếp nhận hướng dẫn
        if (tutor && tutorID === CURRENT_TUTOR_ID && g.status === "accepted") {
          accepted.push(g);
        }

        // CỘT PHẢI: tất cả nhóm chưa có tutor
        if (!tutor) {
          unassigned.push(g);
        }
      });

      setRequestedGroups(requested);
      setUnassignedGroups(unassigned);
      setAcceptedGroups(accepted);

      // Khi reload dữ liệu thì đưa về trang 1 cho an toàn
      setRequestedPage(1);
      setUnassignedPage(1);
      setAcceptedPage(1);
    } catch (err) {
      console.error("[AcceptRegister] loadGroups error:", err);
      setError("Không tải được dữ liệu nhóm. Vui lòng thử lại sau.");
      setRequestedGroups([]);
      setUnassignedGroups([]);
      setAcceptedGroups([]);
      setRequestedPage(1);
      setUnassignedPage(1);
      setAcceptedPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const handleCardClick = (group, type) => {
    setSelectedGroup(group);
    setSelectedType(type);
  };

  const handleCloseDetail = () => {
    setSelectedGroup(null);
    setSelectedType(null);
  };

  const handleAccept = async (groupID) => {
    try {
      const res = await axios.post(`${API_BASE}/accept`, { groupID });
      if (!res.data || !res.data.success) {
        alert(res.data?.message || "Không thể chấp nhận nhóm.");
        return;
      }
      await loadGroups(); // reload lại
    } catch (err) {
      console.error("[AcceptRegister] handleAccept error:", err);
      alert("Lỗi server khi chấp nhận nhóm.");
    }
  };

  const handleReject = async (groupID) => {
    try {
      const res = await axios.post(`${API_BASE}/reject`, { groupID });
      if (!res.data || !res.data.success) {
        alert(res.data?.message || "Không thể từ chối nhóm.");
        return;
      }
      await loadGroups();
    } catch (err) {
      console.error("[AcceptRegister] handleReject error:", err);
      alert("Lỗi server khi từ chối nhóm.");
    }
  };

  // Accept nhóm chưa có tutor (tutor = null)
  const handleAcceptUnassigned = async (groupID) => {
    try {
      // Bước 1: gán tutor hiện tại cho nhóm
      const resRequest = await axios.post(`${API_BASE}/request-tutor`, {
        groupID,
        tutorID: CURRENT_TUTOR_ID,
      });

      if (!resRequest.data || !resRequest.data.success) {
        alert(resRequest.data?.message || "Không thể đăng ký nhận nhóm.");
        return;
      }

      // Bước 2: chấp nhận nhóm đó
      const resAccept = await axios.post(`${API_BASE}/accept`, { groupID });

      if (!resAccept.data || !resAccept.data.success) {
        alert(resAccept.data?.message || "Không thể chấp nhận nhóm.");
        return;
      }

      await loadGroups();
    } catch (err) {
      console.error("[AcceptRegister] handleAcceptUnassigned error:", err);
      alert("Lỗi server khi nhận nhóm chưa được hướng dẫn.");
    }
  };

  if (loading) {
    return (
      <MainLayout role="tutor" showBackground={false}>
        <div className="accept-group-page">
          <h2 className="page-title">Tiếp nhận nhóm hướng dẫn</h2>
          <p>Đang tải danh sách nhóm...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout role="tutor" showBackground={false}>
      <div className="accept-group-page">
        <h2 className="page-title">Tiếp nhận nhóm hướng dẫn</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="accept-group-columns">
          {/* CỘT TRÁI: NHÓM ĐƯỢC YÊU CẦU (status = waiting) */}
          <section className="panel panel--requested">
            <header className="panel-header">
              <h3 className="panel-header__title">Nhóm được yêu cầu</h3>
              <div className="sort">
                <label htmlFor="sort-requested">Sắp xếp theo:</label>
                <select id="sort-requested" defaultValue="newest">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </header>

            <div className="group-list group-list--single-column">
              {requestedGroups.length === 0 ? (
                <p className="empty-text">
                  Hiện không có nhóm nào yêu cầu bạn hướng dẫn.
                </p>
              ) : (
                paginatedRequested.map((group) => (
                  <article
                    key={group.groupID}
                    className="group-card"
                    onClick={() => handleCardClick(group, "requested")}
                  >
                    <header className="group-card__header">
                      <h4 className="group-card__subject">{group.subject}</h4>
                      <span className="group-card__time">
                        {formatDateTime(group.createdDate)}
                      </span>
                    </header>

                    <div className="group-card__meta">
                      <span className="group-card__creator">
                        Người tạo: {mapCreatorName(group)}
                      </span>
                      <span className="group-card__student-id">
                        MSSV: {mapCreatorMSSV(group)}
                      </span>
                    </div>

                    <p className="group-card__members">
                      Thành viên: {group.currentMembers}/{group.maxMembers}
                    </p>
                    <p className="group-card__desc">
                      Mô tả: {group.description}
                    </p>

                    <div
                      className="group-card__actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        label="Từ chối"
                        className="btn btn--reject"
                        onClick={() => handleReject(group.groupID)}
                      />
                      <Button
                        label="Tiếp nhận"
                        className="btn btn--accept"
                        onClick={() => handleAccept(group.groupID)}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            <footer className="panel-footer">
              <div className="panel-footer__info">
                <span>Số lượng nhóm: {requestedGroups.length}</span>
              </div>
              <div className="pagination">
                <button
                  className="pagination-arrow"
                  disabled={requestedPage === 1}
                  onClick={() => changeRequestedPage(-1)}
                >
                  &lt;
                </button>
                <span className="pagination-box">
                  {requestedPage}/{requestedTotalPages}
                </span>
                <button
                  className="pagination-arrow"
                  disabled={requestedPage === requestedTotalPages}
                  onClick={() => changeRequestedPage(1)}
                >
                  &gt;
                </button>
              </div>
            </footer>
          </section>

          {/* CỘT PHẢI: NHÓM CHƯA ĐƯỢC HƯỚNG DẪN (tutor = null) */}
          <section className="panel panel--available">
            <header className="panel-header">
              <h3 className="panel-header__title">
                Danh sách nhóm đang chờ hướng dẫn
              </h3>
              <div className="sort">
                <label htmlFor="sort-available">Sắp xếp theo:</label>
                <select id="sort-available" defaultValue="newest">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </header>

            <div className="group-list group-list--grid-3">
              {unassignedGroups.length === 0 ? (
                <p className="empty-text">
                  Hiện không có nhóm nào chưa được hướng dẫn.
                </p>
              ) : (
                paginatedUnassigned.map((group) => (
                  <article
                    key={group.groupID}
                    className="group-card"
                    onClick={() => handleCardClick(group, "unassigned")}
                  >
                    <header className="group-card__header">
                      <h4 className="group-card__subject">{group.subject}</h4>
                      <span className="group-card__time">
                        {formatDateTime(group.createdDate)}
                      </span>
                    </header>

                    <div className="group-card__meta">
                      <span className="group-card__creator">
                        Người tạo: {mapCreatorName(group)}
                      </span>
                      <span className="group-card__student-id">
                        MSSV: {mapCreatorMSSV(group)}
                      </span>
                    </div>

                    <p className="group-card__members">
                      Thành viên: {group.currentMembers}/{group.maxMembers}
                    </p>
                    <p className="group-card__desc">
                      Mô tả: {group.description}
                    </p>

                    <div
                      className="group-card__actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        label="Tiếp nhận"
                        className="btn btn--accept"
                        onClick={() => handleAcceptUnassigned(group.groupID)}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            <footer className="panel-footer">
              <div className="panel-footer__info">
                <span>Số lượng nhóm: {unassignedGroups.length}</span>
              </div>
              <div className="pagination">
                <button
                  className="pagination-arrow"
                  disabled={unassignedPage === 1}
                  onClick={() => changeUnassignedPage(-1)}
                >
                  &lt;
                </button>
                <span className="pagination-box">
                  {unassignedPage}/{unassignedTotalPages}
                </span>
                <button
                  className="pagination-arrow"
                  disabled={unassignedPage === unassignedTotalPages}
                  onClick={() => changeUnassignedPage(1)}
                >
                  &gt;
                </button>
              </div>
            </footer>
          </section>

          {/* PANEL DƯỚI: Nhóm đã được chính tutor tiếp nhận hướng dẫn */}
          <section className="panel panel--accepted" style={{ marginTop: 24 }}>
            <header className="panel-header">
              <h3 className="panel-header__title">
                Nhóm đang tiếp nhận hướng dẫn
              </h3>
            </header>

            <div className="group-list group-list--grid-4">
              {acceptedGroups.length === 0 ? (
                <p className="empty-text">
                  Bạn chưa có nhóm nào đã tiếp nhận hướng dẫn.
                </p>
              ) : (
                paginatedAccepted.map((group) => (
                  <article
                    key={group.groupID}
                    className="group-card"
                    onClick={() => handleCardClick(group, "accepted")}
                  >
                    <header className="group-card__header">
                      <h4 className="group-card__subject">{group.subject}</h4>
                      <span className="group-card__time">
                        {formatDateTime(group.createdDate)}
                      </span>
                    </header>

                    <div className="group-card__meta">
                      <span className="group-card__creator">
                        Người tạo: {mapCreatorName(group)}
                      </span>
                      <span className="group-card__student-id">
                        MSSV: {mapCreatorMSSV(group)}
                      </span>
                    </div>

                    <p className="group-card__members">
                      Thành viên: {group.currentMembers}/{group.maxMembers}
                    </p>
                    <p className="group-card__desc">{group.description}</p>
                  </article>
                ))
              )}
            </div>

            <footer className="panel-footer">
              <div className="panel-footer__info">
                <span>Số lượng nhóm: {acceptedGroups.length}</span>
              </div>
              <div className="pagination">
                <button
                  className="pagination-arrow"
                  disabled={acceptedPage === 1}
                  onClick={() => changeAcceptedPage(-1)}
                >
                  &lt;
                </button>
                <span className="pagination-box">
                  {acceptedPage}/{acceptedTotalPages}
                </span>
                <button
                  className="pagination-arrow"
                  disabled={acceptedPage === acceptedTotalPages}
                  onClick={() => changeAcceptedPage(1)}
                >
                  &gt;
                </button>
              </div>
            </footer>
          </section>
        </div>

        {/* Modal xem chi tiết nhóm */}
        {selectedGroup && (
          <div className="group-modal-backdrop" onClick={handleCloseDetail}>
            <div
              className="group-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="group-modal__title">
                {selectedType === "requested"
                  ? "Chi tiết nhóm được yêu cầu"
                  : selectedType === "accepted"
                  ? "Chi tiết nhóm đã tiếp nhận"
                  : "Chi tiết nhóm đang chờ hướng dẫn"}
              </h3>

              <div className="group-modal__body">
                <div className="group-modal__row">
                  <span className="group-modal__label">Môn học</span>
                  <span className="group-modal__value">
                    {selectedGroup.subject}
                  </span>
                </div>
                <div className="group-modal__row">
                  <span className="group-modal__label">Thời gian tạo</span>
                  <span className="group-modal__value">
                    {formatDateTime(selectedGroup.createdDate)}
                  </span>
                </div>
                <div className="group-modal__row">
                  <span className="group-modal__label">Người tạo</span>
                  <span className="group-modal__value">
                    {mapCreatorName(selectedGroup)} (
                    {mapCreatorMSSV(selectedGroup)})
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">MSSV: </span>
                  <span className="info-value">
                    {selectedGroup.creatorStudent.studentID}
                  </span>
                </div>
                <div className="group-modal__row">
                  <span className="group-modal__label">Thành viên</span>
                  <span className="group-modal__value">
                    {selectedGroup.currentMembers}/{selectedGroup.maxMembers}
                  </span>
                </div>
                <div className="group-modal__row group-modal__row--full">
                  <span className="group-modal__label">Mô tả</span>
                  <span className="group-modal__value">
                    {selectedGroup.description}
                  </span>
                </div>

                <div style={{ marginTop: "15px" }}>
                  <div
                    className="group-modal__label"
                    style={{ marginBottom: "8px" }}
                  >
                    Thành viên:
                  </div>
                  <div className="group-modal__value">
                    {selectedGroup.member.map((member, index) => (
                      <div key={index}>
                        {member.name} ({member.studentID})
                        {member.studentID ===
                          selectedGroup.creatorStudent.studentID &&
                          " - Người tạo"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="group-modal__footer">
                <Button
                  label="Đóng"
                  className="btn btn--secondary"
                  onClick={handleCloseDetail}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AcceptRegister;
