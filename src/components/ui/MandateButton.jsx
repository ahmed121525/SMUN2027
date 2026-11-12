export default function MandateButton({href=""}) {
  const isGoogleForm = /^https:\/\/(?:forms\.gle\/|docs\.google\.com\/forms\/)/i.test(href);
  return (
    <div className="mandate-button-frame mandate-button-frame--register">
      <a
        className="mandate-button register-button"
        href={isGoogleForm ? href : undefined}
        target={isGoogleForm ? "_blank" : undefined}
        rel={isGoogleForm ? "noopener noreferrer" : undefined}
        aria-label="Register for Sangam Model United Nations 2027"
        aria-disabled={!isGoogleForm}
        onClick={event=>{if(!isGoogleForm)event.preventDefault();}}
      >
        <span className="mandate-button-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg>
        </span>
        <span className="mandate-button-copy">
          <small>CONFERENCE REGISTRATION · SMUN 2027</small>
          <strong>REGISTER NOW</strong>
        </span>
        <span className="mandate-button-arrow" aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
