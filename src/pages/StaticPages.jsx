import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'

const content = {
  warranty: {
    title: 'Warranty Policy',
    sections: [
      { heading: 'Manufacturer Warranty', body: 'All new laptops sold on Ozone Lapcare come with official manufacturer warranty as applicable. The warranty period ranges from 12 to 36 months depending on the brand and model.' },
      { heading: 'Refurbished Products', body: 'Refurbished laptops come with a 6-month warranty from Ozone Lapcare. This covers manufacturing defects and hardware failures, but not physical damage or water damage.' },
      { heading: 'Parts & Accessories', body: 'Laptop parts such as RAM, SSD, batteries, and chargers come with a 3-month warranty. Accessories have a 30-day warranty.' },
      { heading: 'Repair Services', body: 'All repair work carried out by Ozone Lapcare technicians comes with a 90-day warranty on parts used and labor performed.' },
      { heading: 'Warranty Claims', body: 'To claim warranty, contact our support team with your order number and a description of the issue. We will guide you through the process within 24 hours.' },
      { heading: 'Exclusions', body: 'Warranty does not cover physical damage, liquid damage, unauthorized modifications, or damage due to power surges.' },
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      { heading: 'Acceptance of Terms', body: 'By accessing or using the Ozone Lapcare website, you agree to be bound by these terms and conditions.' },
      { heading: 'Product Information', body: 'We strive to provide accurate product descriptions and pricing. In the event of an error, we reserve the right to cancel orders and notify customers.' },
      { heading: 'Orders & Payments', body: 'All orders are subject to availability. Payment is processed securely. We accept Cash on Delivery, UPI, credit/debit cards, and net banking.' },
      { heading: 'Shipping Policy', body: 'Orders are dispatched within 1–2 business days. Delivery typically takes 2–5 business days for metros and 5–7 days for other locations.' },
      { heading: 'Returns & Refunds', body: 'We offer a 7-day return policy for defective products. Items must be in original condition. Refunds are processed within 5–7 business days.' },
      { heading: 'Privacy', body: 'Your personal data is collected and used solely for order processing and customer communication, as outlined in our Privacy Policy.' },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      { heading: 'Information We Collect', body: 'We collect name, email, phone number, address, and payment information necessary to process your orders and provide services.' },
      { heading: 'How We Use Your Information', body: 'Your information is used to process orders, send order updates, provide customer support, and improve our services.' },
      { heading: 'Data Security', body: 'We implement industry-standard security measures including SSL encryption to protect your personal data.' },
      { heading: 'Cookies', body: 'We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.' },
      { heading: 'Third-Party Services', body: 'We may share data with trusted third parties such as payment processors and delivery partners, solely for order fulfillment.' },
      { heading: 'Your Rights', body: 'You have the right to access, update, or delete your personal data. Contact us at privacy@ozoneLapcare.com.' },
    ]
  }
}

export default function StaticPages({ page = 'warranty' }) {
  const data = content[page] || content.warranty
  return (
    <>
      <Helmet>
        <title>{data.title} – Ozone Lapcare</title>
        <meta name="description" content={data.sections[0]?.body?.slice(0, 160) || `Read our ${data.title.toLowerCase()} at Ozone Lapcare.`} />
        <link rel="canonical" href={`${window.location.origin}/${page}`} />
      </Helmet>
      <div className="bg-[#0F172A] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-white">
            {data.title}
          </motion.h1>
          <p className="text-slate-400 mt-3">Last updated: January 2025</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card p-8 md:p-12 space-y-8">
          {data.sections.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <h2 className="text-xl font-black text-[#111827] mb-3 flex items-center gap-3">
                <span className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">{i + 1}</span>
                {s.heading}
              </h2>
              <p className="text-[#374151] leading-relaxed pl-11">{s.body}</p>
            </motion.div>
          ))}
          <div className="pt-6 border-t border-white/20 text-sm text-[#64748B]">
            For any questions, contact us at <a href="mailto:support@ozoneLapcare.com" className="text-primary hover:underline">support@ozoneLapcare.com</a>
          </div>
        </div>
      </div>
    </>
  )
}
