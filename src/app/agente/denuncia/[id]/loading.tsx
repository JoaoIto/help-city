import { Card, CardContent, CardHeader } from "@/app/components/ui/card"

export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                        <div>
                            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card de informações básicas */}
                        <Card>
                            <CardHeader>
                                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="w-full h-16 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-full h-16 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                                <div className="w-full h-24 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-full h-20 bg-gray-200 rounded animate-pulse"></div>
                            </CardContent>
                        </Card>

                        {/* Card de imagens */}
                        <Card>
                            <CardHeader>
                                <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="w-full h-48 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="w-full h-48 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Cards da sidebar */}
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="w-full h-10 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
