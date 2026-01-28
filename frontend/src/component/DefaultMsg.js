/**
 * DefaultMsg Component
 * Reusable empty state message with icon
 */

export default function DefaultMsg({
    icon = "🔍",
    title = "Ready to find your perfect workspace?",
    description = "Select your date and time above, then click \"Search Availability\" to see available spaces"
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-[32px]">
            <div className="w-24 h-24 bg-yellow-300 rounded-full border-[3px] border-black flex items-center justify-center mb-6">
                <span className="text-4xl">{icon}</span>
            </div>
            <div>
                <p className="text-lg font-medium text-neutral-950 tracking-tight mb-2">
                    {title}
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    {description}
                </p>
            </div>
        </div>
    );
}
