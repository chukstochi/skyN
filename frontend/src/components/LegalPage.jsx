import { Link } from 'react-router-dom'

const SITE = 'Sky_N_News'
const EMAIL = 'skynnews15@gmail.com' // replace with your real contact email
const UPDATED = 'October 2026'

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Who we are', `${SITE} is an online news website. This policy explains what information we collect, how we use it and the choices you have. It is written in line with the Nigeria Data Protection Act 2023.`],
      ['Information we collect', `Email address: only if you subscribe to our newsletter. Technical data: our hosting provider may automatically record basic information such as IP address, browser type and the pages visited, for security and to keep the site running. You do not need an account to read ${SITE}.`],
      ['How we use your information', 'We use your email address only to send you the news updates you asked for. We use technical data to keep the site secure, fix problems and understand how the site is used. We do not sell your personal information.'],
      ['Who we share it with', 'We share information only with the service providers that help us run the site (such as hosting and email delivery), and only as needed for them to do so. We may also disclose information if the law requires it.'],
      ['Social media and third-party links', 'Our articles may contain links to other websites, and share buttons for platforms such as WhatsApp, X, Facebook, Telegram and LinkedIn. When you use them, that platform’s own privacy policy applies. We are not responsible for the practices of other websites.'],
      ['How long we keep it and how we protect it', 'We keep subscriber emails until you unsubscribe or ask us to delete them. We use reasonable technical and organisational measures to protect your information, but no system is completely secure.'],
      ['Your rights', `You may ask to see, correct or delete the personal information we hold about you, to unsubscribe at any time, or to object to how we use it. Contact us at ${EMAIL} and we will respond as soon as we reasonably can.`],
      ['Children', 'Our site is not directed at children under 13, and we do not knowingly collect their personal information.'],
      ['Changes to this policy', 'We may update this policy from time to time. The date at the top shows when it was last changed.'],
      ['Contact us', `Questions about privacy? Email ${EMAIL}.`],
    ],
  },
  terms: {
    title: 'Terms & Editorial Policy',
    sections: [
      ['Using this site', `By using ${SITE} you agree to these terms. You may read and share our articles for personal, non-commercial use. Please do not copy our content in bulk, scrape the site or use it in a way that could damage or overload it.`],
      ['How our news is produced', 'Some of our stories are written by our team. Others are short summaries based on reports from established news organisations. Those summaries are rewritten in our own words with the help of AI tools and reviewed by our editors before publication. We credit the original source on each article where one applies, and we do not copy source articles word for word.'],
      ['Accuracy and corrections', `We work to be accurate and fair, but mistakes can happen. If you find an error, email ${EMAIL} and we will review it and correct it promptly.`],
      ['Not professional advice', 'News and commentary on this site are for general information only. Nothing here is legal, medical, financial or investment advice.'],
      ['Copyright and takedown requests', `Our original content belongs to ${SITE}. Names, logos and images belonging to others stay with their owners. If you believe something on the site infringes your rights, email ${EMAIL} with the article link and details, and we will look into it quickly.`],
      ['Links and third parties', 'We are not responsible for the content of external websites we link to, or for opinions expressed by people quoted in our reports.'],
      ['Limitation of liability', `We provide ${SITE} “as is”. To the extent the law allows, we are not liable for losses that result from using the site or relying on its content.`],
      ['Changes', 'We may update these terms from time to time. Continuing to use the site means you accept the updated terms.'],
      ['Contact us', `Questions? Email ${EMAIL}.`],
    ],
  },
}

export default function LegalPage({ page }) {
  const p = PAGES[page]
  if (!p) return null
  return (
    <div className="w" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px', lineHeight: 1.7 }}>
      <Link to="/">← Back to {SITE}</Link>
      <h1 style={{ marginTop: 20 }}>{p.title}</h1>
      <p style={{ opacity: 0.7 }}>Last updated: {UPDATED}</p>
      {p.sections.map(([heading, text], i) => (
        <section key={heading}>
          <h2 style={{ fontSize: 20, marginTop: 28 }}>
            {i + 1}. {heading}
          </h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  )
}