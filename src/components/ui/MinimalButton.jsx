export default function MinimalButton({href,onClick,children,ariaLabel,type="button",variant="quiet"}) {
  const className = "minimal-button" + (variant === "solid" ? " minimal-button--solid" : "");
  const contents = <><span>{children}</span><span className="minimal-button-arrow" aria-hidden="true">↗</span></>;
  if (href) return <a className={className} href={href} aria-label={ariaLabel}>{contents}</a>;
  return <button className={className} type={type} onClick={onClick} aria-label={ariaLabel}>{contents}</button>;
}
