// client/src/pages/student/JoinSession.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import './JoinSession.css';

const PAGE_SIZE = 4;

const JoinSession = () => {
  const studentId = localStorage.getItem('studentId') || '2311327';

  const [availableClasses, setAvailableClasses] = useState([]);
  const [joinedClasses, setJoinedClasses] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // filter
  const [filterSubject, setFilterSubject] = useState('');
  const [filterFormat, setFilterFormat] = useState('Any');

  // sort + pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [sortMode] = useState('time'); // chỉ "Thứ tự dạy"

  const lastUpdateTime = new Date().toLocaleString('vi-VN');

  // ===== API =====
  const fetchAvailableClasses = async (subject = '', format = 'Any') => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        'http://localhost:5000/api/sessions/available-classes',
        { params: { subject, format } }
      );

      setAvailableClasses(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách có thể đăng ký:', err);
      setError('Không thể tải danh sách buổi học. Vui lòng kiểm tra lại server.');
      setAvailableClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedClasses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/sessions/student-classes/${studentId}`
      );
      setJoinedClasses(res.data.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đã tham gia:', err);
      setJoinedClasses([]);
    }
  };

  useEffect(() => {
    fetchAvailableClasses();
    fetchJoinedClasses();
  }, [studentId]);

  // ===== Lọc / tìm kiếm =====
  const handleSearch = () => {
    fetchAvailableClasses(filterSubject, filterFormat);
    setCurrentPage(1);
  };

  const handleResetFilter = () => {
    setFilterSubject('');
    setFilterFormat('Any');
    fetchAvailableClasses('', 'Any');
    setCurrentPage(1);
  };

  // ===== Tham gia buổi học =====
  const handleJoinClass = async (cls) => {
    if (!window.confirm(`Bạn muốn tham gia buổi học "${cls.subject}"?`)) return;

    try {
      const res = await axios.post('http://localhost:5000/api/sessions/join', {
        studentId,
        classId: cls.id
      });

      const updated = res.data.updatedClass;

      // cập nhật list available
      setAvailableClasses(prev =>
        prev.map(c => (c.id === updated.id ? updated : c))
      );

      // thêm vào list đã tham gia
      setJoinedClasses(prev => [...prev, updated]);

      alert('Đăng ký buổi học thành công.');
    } catch (err) {
      console.error('Lỗi khi tham gia buổi học:', err);
      const msg =
        err.response?.data?.message || 'Không thể tham gia buổi học. Vui lòng thử lại.';
      alert(msg);
    }
  };

  // ===== Helper thời gian + sort =====
  const parseDateFlexible = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    const m = dateStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (m) {
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const year = parseInt(m[3], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  const getSortKey = (cls) => {
    const d = parseDateFlexible(cls.date);
    let base = d ? d.getTime() : 0;

    if (cls.time) {
      const tm = cls.time.match(/(\d{1,2})[:h](\d{2})/);
      if (tm) {
        const h = parseInt(tm[1], 10);
        const m = parseInt(tm[2], 10);
        base += (h * 60 + m) * 60 * 1000;
      }
    }
    return base;
  };

  let sortedAvailable = [...availableClasses];
  if (sortMode === 'time') {
    sortedAvailable.sort((a, b) => getSortKey(a) - getSortKey(b));
  }

  const totalGroups = sortedAvailable.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages) || 1;
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageClasses = sortedAvailable.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const formatClassDateTime = (cls) => {
    if (!cls?.date && !cls?.time) return 'Chưa cập nhật';

    let datePart = 'Chưa cập nhật';
    if (cls?.date) {
      const d = parseDateFlexible(cls.date);
      datePart = d ? d.toLocaleDateString('vi-VN') : cls.date;
    }

    if (cls?.time) {
      return `${datePart} từ ${cls.time}`;
    }
    return datePart;
  };

  // options môn học trong filter: lấy từ availableClasses
  const subjectOptions = [
    ...new Set(availableClasses.map(c => c.subject).filter(Boolean))
  ];

  return (
    <MainLayout role="student">
      <div className="sj-wrapper">
        <div className="sj-container">
          {/* ==== Cột trái: Tìm lớp học + nhóm đã tham gia ==== */}
          <aside className="sj-sidebar">
            {/* Tìm lớp học */}
            <div className="sj-card">
              <div className="sj-card-header">
                <h3>Tham dự lớp học</h3>
              </div>
              <div className="sj-card-body">
                {/* Môn học */}
                <div className="sj-form-group">
                  <label>Môn học</label>
                  <select
                    value={filterSubject}
                    onChange={e => setFilterSubject(e.target.value)}
                  >
                    <option value="">Any</option>
                    {subjectOptions.map(sub => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hình thức */}
                <div className="sj-form-group">
                  <label>Hình thức</label>
                  <select
                    value={filterFormat}
                    onChange={e => setFilterFormat(e.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option value="On site">On site</option>
                    <option value="Off site">Off site (online)</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="sj-search-actions">
                  <button
                    type="button"
                    className="sj-btn-primary"
                    onClick={handleSearch}
                  >
                    Tìm kiếm
                  </button>
                  <button
                    type="button"
                    className="sj-btn-secondary"
                    onClick={handleResetFilter}
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách nhóm đã tham gia */}
            <div className="sj-card">
              <div className="sj-card-header small">
                <h4>Danh sách nhóm đã tham gia</h4>
              </div>
              <div className="sj-card-body">
                {joinedClasses.length === 0 ? (
                  <p className="sj-muted">
                    Bạn chưa tham gia buổi học nào.
                  </p>
                ) : (
                  <ul className="sj-joined-list">
                    {joinedClasses.map(cls => (
                      <li key={cls.id} className="sj-joined-item">
                        <div className="sj-joined-text">
                          <div className="sj-joined-subject">
                            {cls.subject}
                          </div>
                          <div className="sj-joined-desc">
                            {cls.description || 'Không có mô tả'}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="sj-link-btn"
                        >
                          Chi tiết
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* (Optional) phân trang nhỏ cho joined, hiện giờ bỏ qua vì số ít */}
            </div>
          </aside>

          {/* ==== Cột phải: Danh sách buổi học có thể đăng kí ==== */}
          <section className="sj-main">
            <div className="sj-main-header">
              <div>
                <h2>Danh sách các buổi học có thể đăng kí</h2>
              </div>
              <div className="sj-main-header-right">
                <div className="sj-week-sort">
                  <span className="sj-week-label">Tuần 43</span>
                  <div className="sj-sort-select">
                    <span>Sắp xếp theo:</span>
                    <select value={sortMode} disabled>
                      <option value="time">Thứ tự dạy</option>
                    </select>
                  </div>
                </div>
                <div className="sj-last-update">
                  Cập nhật lần cuối: {lastUpdateTime}
                </div>
              </div>
            </div>

            {error && <div className="sj-error">{error}</div>}

            {loading ? (
              <div className="sj-loading">Đang tải dữ liệu...</div>
            ) : totalGroups === 0 ? (
              <div className="sj-empty">
                Không có buổi học nào phù hợp.
              </div>
            ) : (
              <>
                <div className="sj-class-grid">
                  {pageClasses.map(cls => {
                    let shortDate = '';
                    if (cls.date) {
                      const d = parseDateFlexible(cls.date);
                      shortDate = d
                        ? d.toLocaleDateString('vi-VN')
                        : cls.date;
                    }

                    const fullTime = formatClassDateTime(cls);

                    return (
                      <article key={cls.id} className="sj-class-card">
                        <header className="sj-class-card-header">
                          <div>
                            <div className="sj-class-subject">
                              {cls.subject || 'Môn học'}
                            </div>
                            <div className="sj-class-tutor">
                              <strong>Tutor:</strong> {cls.tutor || 'Chưa cập nhật'}
                            </div>
                          </div>
                          <div className="sj-class-header-right">
                            {shortDate && (
                              <div className="sj-class-date-top">
                                {shortDate} {cls.time?.split(' ')[0] || ''}
                              </div>
                            )}
                            {/* bạn có thể chỉnh text cho giống hình hơn */}
                          </div>
                        </header>

                        <div className="sj-class-body">
                          <p>
                            <strong>Nội dung:</strong>{' '}
                            {cls.description || 'Chưa cập nhật'}
                          </p>
                          <p>
                            <strong>Hình thức:</strong>{' '}
                            {cls.format || 'Không có'}
                          </p>
                          <p>
                            <strong>Địa điểm:</strong>{' '}
                            {cls.location || 'Không có'}
                          </p>
                          <p>
                            <strong>Link học online:</strong>{' '}
                            {cls.onlineLink || 'Không có'}
                          </p>
                          <p>
                            <strong>Thời gian:</strong> {fullTime}
                          </p>
                          <p>
                            <strong>Số lượng:</strong>{' '}
                            {(cls.studentCount ?? 0) +
                              (cls.capacity ? `/${cls.capacity}` : '')}
                          </p>
                        </div>

                        <footer className="sj-card-footer">
                          <div className="sj-status">
                            {cls.status || 'Sắp diễn ra'}
                          </div>
                          <button
                            type="button"
                            className="sj-btn-primary"
                            onClick={() => handleJoinClass(cls)}
                          >
                            Tham gia
                          </button>
                        </footer>
                      </article>
                    );
                  })}
                </div>

                {/* footer + pagination */}
                <div className="sj-main-footer">
                  <div className="sj-group-count">
                    Số lượng nhóm: {totalGroups}
                  </div>
                  {totalPages > 1 && (
                    <div className="sj-pagination">
                      <button
                        type="button"
                        className="sj-page-btn"
                        onClick={() =>
                          setCurrentPage(p => Math.max(1, p - 1))
                        }
                        disabled={safePage === 1}
                      >
                        ‹
                      </button>
                      <span className="sj-page-info">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        className="sj-page-btn"
                        onClick={() =>
                          setCurrentPage(p =>
                            Math.min(totalPages, p + 1)
                          )
                        }
                        disabled={safePage === totalPages}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default JoinSession;
