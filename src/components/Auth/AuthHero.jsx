import { randomImages } from "../../constants"

const AuthHero = () => {
    const generateRandomImages = () => randomImages[Math.floor(Math.random() * randomImages.length)]

    return (
        <div className="w-full relative flex-1">
            <img src={generateRandomImages()} className="w-full h-full object-cover" alt="Auth Image" />
            <div className="rounded-2xl bg-white/5 backdrop-blur-xs shadow-md p-8 flex flex-col gap-2 absolute bottom-6 w-[calc(100%-32px)] left-1/2 -translate-x-1/2 text-white">
                <h2 className="font-bold text-2xl">
                    فوج تشهيلات مطارات القوات المسلحة
                </h2>
                <p className="text-base">
                    فوج تشهيلات مطارات القوات المسلحة هو أحد الوحدات المخصصة لمهمة استقبال وتوديع الوفود العسكرية المصرية والاجنبية في جميع المطارات المدنية والعسكرية مع ( استقبال / ترحيل ) جميع انواع المشحونات العسكرية والمساعدات الانسانية الواردة او الصادرة لصالح القوات المسلحة.
                </p>
            </div>
        </div>
    )
}

export default AuthHero