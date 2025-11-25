// client/src/pages/tutor/RegisterTeaching.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../components/MainLayout';
import './RegisterTeaching.css';

const PAGE_SIZE = 4; // mỗi trang tối đa 4 lớp

const RegisterTeaching = () => {
  const tutorId = localStorage.getItem('GV001') || 'GV001';

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openSection, setOpenSection] = useState('register'); // 'register' | 'subjects' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClass, setSelectedClass] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newSession, setNewSession] = useState({
    subject: '',
    content: '',
    date: '',
    startTime: '',
    endTime: '',
    format: '',
    location: '',
    onlineLink: '',
    capacity: ''
  });

  const [subjectSearch, setSubjectSearch] = useState('');

  // sort/pagination
  const [sortMode] = useState('time'); // hiện tại chỉ có "Thứ tự dạy"
  const [currentPage, setCurrentPage] = useState(1);

  // ========= API =========
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `http://localhost:5000/api/sessions/tutor-classes/${tutorId}`,
        { params: { page: 1, limit: 100 } }
      );

      const data = res.data;
      setClasses(data.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách lớp:', err);
      setError('Không thể tải danh sách các buổi dạy. Vui lòng kiểm tra lại server.');
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/sessions/tutor-subjects/${tutorId}`
        );
        setSubjects(res.data.data || []);
      } catch (err) {
        console.error('Lỗi khi lấy danh sách môn học:', err);
        setSubjects([]);
      }
    };

    fetchSubjects();
    fetchClasses();
  }, [tutorId]);

  const handleNewSessionChange = (field, value) => {
    setNewSession(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitNewSession = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        tutorId,
        subject: newSession.subject,
        date: newSession.date,
        time: `${newSession.startTime} - ${newSession.endTime}`,
        room: newSession.location,
        description: newSession.content,
        format: newSession.format,
        onlineLink: newSession.onlineLink,
        capacity: newSession.capacity
      };

      const res = await axios.post(
        'http://localhost:5000/api/sessions/create',
        payload
      );

      console.log('Created session:', res.data);
      const createdClass = res.data.class;

      // thêm card mới vào danh sách để thấy ngay
      if (createdClass) {
        setClasses(prev => [...prev, createdClass]);
      }

      alert('Đăng ký buổi dạy mới thành công.');

      setShowCreateForm(false);
      setNewSession({
        subject: '',
        content: '',
        date: '',
        startTime: '',
        endTime: '',
        format: '',
        location: '',
        onlineLink: '',
        capacity: ''
      });

      // chuyển về trang cuối cùng (nơi có lớp mới)
      const newTotal = (classes.length || 0) + 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
      setCurrentPage(newTotalPages);
    } catch (err) {
      console.error('Lỗi khi tạo buổi dạy mới:', err);
      setError('Không thể tạo buổi dạy mới. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Accordion trái: chỉ mở 1 cái
  const handleToggleSection = (key) => {
    setOpenSection(prev => (prev === key ? null : key));
  };

  // Lọc môn theo từ khóa
  const filteredSubjects = subjects.filter((sub) => {
    if (!subjectSearch.trim()) return true;
    const query = subjectSearch.toLowerCase();
    const name = (sub.name || '').toLowerCase();
    const code = (sub.code || '').toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  // ===== Modal =====
  const handleOpenEditModal = (cls) => {
    // đã bấm "Chỉnh sửa" ở ngoài rồi -> vào đây là sửa luôn
    setSelectedClass(cls);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
  };

  const handleEditFieldChange = (field, value) => {
    setSelectedClass(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = () => {
    if (!selectedClass) return;

    // Demo: chỉ update local
    setClasses(prev =>
      prev.map(c => (c.id === selectedClass.id ? selectedClass : c))
    );

    alert('Lưu thay đổi thành công (demo UI, chưa ghi xuống server).');
    handleCloseEditModal();
  };

  // ===== Hủy buổi học (xóa card) =====
  const handleCancelClass = async (cls) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy buổi học này?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/sessions/${cls.id}`);
      setClasses(prev => prev.filter(c => c.id !== cls.id));
    } catch (err) {
      console.error('Lỗi khi hủy buổi học:', err);
      alert('Không thể hủy buổi học. Vui lòng thử lại.');
    }
  };

  // Helpers parse date/time để sắp xếp
  const parseDateFlexible = (dateStr) => {
    if (!dateStr) return null;
    let d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    // thử dạng dd/MM/yyyy hoặc dd-MM-yyyy
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

  // sắp xếp theo thứ tự dạy (thời gian tăng dần)
  let sortedClasses = [...classes];
  if (sortMode === 'time') {
    sortedClasses.sort((a, b) => getSortKey(a) - getSortKey(b));
  }

  const totalGroups = sortedClasses.length;
  const totalPages = Math.max(1, Math.ceil(totalGroups / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages) || 1;
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedClasses = sortedClasses.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // Format thời gian cho card
  const formatClassDateTime = (cls) => {
    if (!cls?.date && !cls?.time) return 'Chưa cập nhật';

    let datePart = 'Chưa cập nhật';
    if (cls?.date) {
      const d = parseDateFlexible(cls.date);
      if (d) {
        datePart = d.toLocaleDateString('vi-VN');
      } else {
        datePart = cls.date;
      }
    }

    if (cls?.time) {
      return `${datePart} từ ${cls.time}`;
    }
    return datePart;
  };

  const lastUpdateTime = new Date().toLocaleString('vi-VN');

  return (
    <MainLayout role="tutor">
      <div className="rt-wrapper">
        <div className="rt-container">
          {/* ===== Sidebar trái ===== */}
          <aside className="rt-sidebar">
            {/* SECTION 1: Các chủ đề giảng dạy (search) */}
            <div className="rt-accordion-section">
              <div
                className="rt-accordion-header"
                onClick={() => handleToggleSection('subjects')}
              >
                <span className="rt-accordion-title">Các chủ đề giảng dạy</span>
                <span className="rt-accordion-arrow">
                  {openSection === 'subjects' ? '▲' : '▼'}
                </span>
              </div>
              {openSection === 'subjects' && (
                <div className="rt-accordion-body">
                  <p className="rt-accordion-note">
                    Tìm kiếm các môn học mà giảng viên có thể dạy theo tên hoặc mã môn.
                  </p>

                  <div className="rt-subject-search">
                    <input
                      type="text"
                      placeholder="Tìm theo tên hoặc mã môn..."
                      value={subjectSearch}
                      onChange={e => setSubjectSearch(e.target.value)}
                    />
                  </div>

                  {subjects.length === 0 ? (
                    <p className="rt-accordion-desc">
                      Hiện chưa có dữ liệu môn học từ hệ thống.
                    </p>
                  ) : filteredSubjects.length === 0 ? (
                    <p className="rt-accordion-desc">
                      Không tìm thấy môn học nào phù hợp với từ khóa.
                    </p>
                  ) : (
                    <ul className="rt-subject-list">
                      {filteredSubjects.map(sub => (
                        <li
                          key={sub.code || sub.name}
                          className="rt-subject-item"
                        >
                          <div className="rt-subject-name">{sub.name}</div>
                          <div className="rt-subject-code">
                            Mã môn: {sub.code || 'N/A'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 2: Đăng ký dạy */}
            <div className="rt-accordion-section">
              <div
                className="rt-accordion-header"
                onClick={() => handleToggleSection('register')}
              >
                <span className="rt-accordion-title">Đăng ký dạy</span>
                <span className="rt-accordion-arrow">
                  {openSection === 'register' ? '▲' : '▼'}
                </span>
              </div>
              {openSection === 'register' && (
                <div className="rt-accordion-body">
                  <form onSubmit={handleSubmitNewSession}>
                    <div className="rt-form-group">
                      <label>Môn học</label>
                      <input
                        type="text"
                        placeholder="Tên môn học/Mã môn"
                        value={newSession.subject}
                        onChange={e =>
                          handleNewSessionChange('subject', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="rt-form-group">
                      <label>Nội dung học</label>
                      <input
                        type="text"
                        placeholder="VD: chủ đề mở rộng/ôn tập"
                        value={newSession.content}
                        onChange={e =>
                          handleNewSessionChange('content', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="rt-form-group">
                      <label>Ngày học</label>
                      <input
                        type="date"
                        value={newSession.date}
                        onChange={e =>
                          handleNewSessionChange('date', e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="rt-form-row">
                      <div className="rt-form-group">
                        <label>Giờ bắt đầu</label>
                        <input
                          type="time"
                          value={newSession.startTime}
                          onChange={e =>
                            handleNewSessionChange('startTime', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="rt-form-group">
                        <label>Giờ kết thúc</label>
                        <input
                          type="time"
                          value={newSession.endTime}
                          onChange={e =>
                            handleNewSessionChange('endTime', e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="rt-form-group">
                      <label>Hình thức</label>
                      <select
                        value={newSession.format}
                        onChange={e =>
                          handleNewSessionChange('format', e.target.value)
                        }
                      >
                        <option value="">On site/Off site/Both</option>
                        <option value="On site">On site</option>
                        <option value="Off site">Off site (online)</option>
                        <option value="Both">Both</option>
                      </select>
                    </div>

                    <div className="rt-form-group">
                      <label>Địa điểm</label>
                      <input
                        type="text"
                        placeholder="VD: H6-305"
                        value={newSession.location}
                        onChange={e =>
                          handleNewSessionChange('location', e.target.value)
                        }
                      />
                    </div>

                    <div className="rt-form-group">
                      <label>Link học online</label>
                      <input
                        type="text"
                        placeholder="Link học online"
                        value={newSession.onlineLink}
                        onChange={e =>
                          handleNewSessionChange('onlineLink', e.target.value)
                        }
                      />
                    </div>

                    <div className="rt-form-group">
                      <label>Số lượng tối đa</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Số lượng sinh viên tham dự"
                        value={newSession.capacity}
                        onChange={e =>
                          handleNewSessionChange('capacity', e.target.value)
                        }
                      />
                    </div>

                    <div className="rt-create-actions">
                      <button type="submit" className="rt-btn-primary">
                        Lưu buổi dạy
                      </button>
                    </div>

                    <p className="rt-accordion-note" style={{ marginTop: '6px' }}>
                      * Chỉ mở được một chức năng tại một thời điểm, đúng mô tả đề bài.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </aside>

          {/* ===== Bên phải: card buổi dạy + tuần + phân trang ===== */}
          <section className="rt-main">
            <div className="rt-header">
              <div>
                <h2>Quản lý buổi học dạy của bạn</h2>
              </div>

                <div className="rt-header-right">
                {/* Hàng trên: Tuần 43 + Sắp xếp theo */}
                <div className="rt-header-row">
                <span className="rt-week-label">Tuần 43</span>
                <span className="rt-header-sort-label">Sắp xếp theo:</span>
                <select
                    className="rt-header-sort-select"
                    value="time"
                    disabled
                >
                    <option value="time">Thứ tự dạy</option>
                </select>
                </div>
                <div className="rt-header-info">
                  Cập nhật lần cuối: {lastUpdateTime}
                </div>
              </div>
            </div>

            {error && <div className="rt-error">{error}</div>}

            {loading ? (
              <div className="rt-loading">Đang tải dữ liệu...</div>
            ) : totalGroups === 0 ? (
              <div className="rt-empty">Hiện chưa có buổi dạy nào.</div>
            ) : (
              <>
                <div className="rt-class-grid">
                  {paginatedClasses.map((cls) => {
                    let shortDate = '';
                    if (cls.date) {
                      const d = parseDateFlexible(cls.date);
                      shortDate = d
                        ? d.toLocaleDateString('vi-VN')
                        : cls.date;
                    }

                    const fullTime = formatClassDateTime(cls);

                    return (
                      <article key={cls.id} className="rt-class-card">
                        <header className="rt-class-card-header">
                          <div>
                            <div className="rt-class-subject">
                              {cls.subject || 'Môn học'}
                              {cls.classCode ? ` (${cls.classCode})` : ''}
                            </div>
                            <div className="rt-class-mssv">
                              MSCB: 12345
                            </div>
                          </div>
                          <div className="rt-class-header-right">
                            {shortDate && (
                              <div className="rt-class-date-top">{shortDate}</div>
                            )}
                            {cls.time && (
                              <div className="rt-class-time-top">{cls.time}</div>
                            )}
                          </div>
                        </header>

                        <div className="rt-class-body">
                          <p className="rt-class-line">
                            <strong>Nội dung:</strong>{' '}
                            {cls.description || 'Chưa cập nhật'}
                          </p>
                          <p className="rt-class-line">
                            <strong>Hình thức:</strong>{' '}
                            {cls.format || 'Không có'}
                          </p>
                          <p className="rt-class-line">
                            <strong>Địa điểm:</strong>{' '}
                            {cls.location || 'Không có'}
                          </p>
                          <p className="rt-class-line">
                            <strong>Link học online:</strong>{' '}
                            {cls.onlineLink || 'Không có'}
                          </p>
                          <p className="rt-class-line">
                            <strong>Thời gian:</strong> {fullTime}
                          </p>
                          <p className="rt-class-line">
                            <strong>Số lượng:</strong>{' '}
                            {(cls.studentCount ?? 0) +
                              (cls.capacity ? `/${cls.capacity}` : '')}
                          </p>
                        </div>

                        <footer className="rt-card-footer">
                          <div className="rt-class-status">
                            {cls.status || 'Sắp diễn ra'}
                          </div>
                          <div className="rt-card-actions">
                            <button
                              type="button"
                              className="rt-btn-danger"
                              onClick={() => handleCancelClass(cls)}
                            >
                              Hủy buổi học
                            </button>
                            <button
                              type="button"
                              className="rt-btn-secondary"
                              onClick={() => handleOpenEditModal(cls)}
                            >
                              Chỉnh sửa
                            </button>
                          </div>
                        </footer>
                      </article>
                    );
                  })}
                </div>

                {/* footer info + pagination */}
                <div className="rt-main-footer">
                  <div className="rt-group-count">
                    Số lượng nhóm: {totalGroups}
                  </div>

                  {totalPages > 1 && (
                    <div className="rt-pagination">
                      <button
                        type="button"
                        className="rt-page-btn"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={safePage === 1}
                      >
                        ‹
                      </button>
                      <span className="rt-page-info">
                        {safePage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        className="rt-page-btn"
                        onClick={() =>
                          setCurrentPage((p) =>
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

        {/* ===== Modal chỉnh sửa ===== */}
        {isEditModalOpen && selectedClass && (
          <div className="rt-modal-backdrop">
            <div className="rt-modal">
              <div className="rt-modal-header">
                <h3>Thông tin buổi dạy</h3>
                <button
                  type="button"
                  className="rt-modal-close"
                  onClick={handleCloseEditModal}
                >
                  ✕
                </button>
              </div>

              <div className="rt-modal-body">
                <div className="rt-modal-row">
                  <div className="rt-modal-field">
                    <label>Tên lớp</label>
                    <input
                      type="text"
                      value={selectedClass.className || ''}
                      disabled
                    />
                  </div>
                  <div className="rt-modal-field">
                    <label>Mã lớp</label>
                    <input
                      type="text"
                      value={selectedClass.classCode || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="rt-modal-row">
                  <div className="rt-modal-field">
                    <label>Ngày dạy</label>
                    <input
                      type="date"
                      value={selectedClass.date || ''}
                      onChange={e =>
                        handleEditFieldChange('date', e.target.value)
                      }
                    />
                  </div>
                  <div className="rt-modal-field">
                    <label>Thời gian</label>
                    <input
                      type="text"
                      value={selectedClass.time || ''}
                      onChange={e =>
                        handleEditFieldChange('time', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="rt-modal-row">
                  <div className="rt-modal-field">
                    <label>Địa điểm</label>
                    <input
                      type="text"
                      value={selectedClass.location || ''}
                      onChange={e =>
                        handleEditFieldChange('location', e.target.value)
                      }
                    />
                  </div>
                  <div className="rt-modal-field">
                    <label>Hình thức</label>
                    <input
                      type="text"
                      value={selectedClass.format || ''}
                      onChange={e =>
                        handleEditFieldChange('format', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="rt-modal-row">
                  <div className="rt-modal-field full-width">
                    <label>Link học online</label>
                    <input
                      type="text"
                      value={selectedClass.onlineLink || ''}
                      onChange={e =>
                        handleEditFieldChange('onlineLink', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="rt-modal-row">
                  <div className="rt-modal-field full-width">
                    <label>Mô tả nội dung</label>
                    <textarea
                      rows={3}
                      value={selectedClass.description || ''}
                      onChange={e =>
                        handleEditFieldChange('description', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="rt-modal-footer">
                {/* Không còn nút "Chỉnh sửa" nữa, vào là sửa luôn */}
                <button
                  type="button"
                  className="rt-btn-secondary"
                  onClick={handleCloseEditModal}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className="rt-btn-primary"
                  onClick={handleSaveEdit}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RegisterTeaching;
