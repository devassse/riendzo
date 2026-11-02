/** Red asterisk for a required field (also announced to screen readers). */
export default function Req() {
    return (
        <>
            <span aria-hidden="true" className="ml-0.5 font-bold text-[#d23b25]">*</span>
            <span className="sr-only"> (obrigatório)</span>
        </>
    );
}

/** Legend to put above the submit button of a form that has required fields. */
export function RequiredNote() {
    return (
        <p className="text-[11px] text-[#5b6478]"><span aria-hidden="true" className="font-bold text-[#d23b25]">*</span> Campo obrigatório</p>
    );
}
