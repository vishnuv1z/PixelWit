export default function EditorSkeleton() {
  return (
    <div className="card editor-card p-3 skeleton-card">
      <div className="d-flex align-items-center">
        <div className="skeleton-avatar"></div>

        <div className="ms-3 flex-grow-1">
          <div className="skeleton-line skeleton-name"></div>
          <div className="skeleton-line skeleton-role"></div>

          <div className="d-flex mt-2">
            <div className="skeleton-badge me-2"></div>
            <div className="skeleton-badge"></div>
          </div>
        </div>
      </div>
    </div>
  );
}