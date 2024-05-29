import React, { useEffect, useRef } from "react";

import "../styles/popup.css";

export default function Popup({
  header: headerText,
  show,
  setShow,
  innerComponent: InnerComponent,
  innerComponentProps = null,
}) {
  const windowRef = useRef(null);

  function close() {
    setShow(false);
  }

  useEffect(() => {
    if (!show) {
      windowRef.current.classList.add("hidden");
    } else {
      windowRef.current.classList.remove("hidden");
    }
  }, [show]);

  return (
    <section ref={windowRef} className="popup-wrapper hidden">
      <section className="popup-body">
        <div className="popup-close" onClick={close}>
          &times;
        </div>
        <h2>{headerText}</h2>
        <section className="popup-content-wrapper">
          <InnerComponent {...innerComponentProps} />
        </section>
      </section>
    </section>
  );
}
