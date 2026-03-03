import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Input } from "@/components/ui/Input";
import { Search, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ArticleCard } from "../components/ArticleCard";
import { regulationApi } from "../api/regulation.api";
import { useQuery } from "@tanstack/react-query";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { useAuthStore } from "@/store/auth.store";
import { RegulationFormModal } from "../components/RegulationFormModal";
import { RegulationArticle } from "../types/regulation.types";
import clsx from "clsx";

const RegulationPage = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] =
    useState<RegulationArticle | null>(null);

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["regulation-articles"],
    queryFn: () => regulationApi.getAllActive(),
  });

  const regulationCategories = useMemo(() => {
    const categories = new Set(articles.map((article) => article.category));
    return ["Todos", ...Array.from(categories)];
  }, [articles]);

  const filteredArticles = articles.filter((article) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      article.title.toLowerCase().includes(searchLower) ||
      article.article_num.toLowerCase().includes(searchLower) ||
      article.description.toLowerCase().includes(searchLower);

    const matchesCategory =
      selectedCategory === "Todos" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setSelectedArticle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (article: RegulationArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search and Filter Section */}

      <PageHeader
        title={
          <>
            Disciplina & <span className="text-primary">Reglamento</span>
          </>
        }
        description="Consulta los artículos oficiales, normativas de conducta y el sistema de sanciones vigente."
        actions={
          user?.rol === "ADMIN" && (
            <Button
              className="gap-2 shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
              onClick={handleCreateNew}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Crear Artículo</span>
            </Button>
          )
        }
      />

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 sm:max-w-md">
              <Input
                placeholder="Buscar por artículo, palabra clave o tipo de falta..."
                leftIcon={<Search className="w-5 h-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        }
      />

      {/* Categories Tabs */}
      {!isLoading && regulationCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {regulationCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={clsx(
                "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border",
                selectedCategory === category
                  ? "bg-primary text-white border-primary"
                  : "bg-surface hover:bg-elevated border-border text-text",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Rules Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <InlineSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard
                key={article.article_id}
                article={article}
                isAdmin={user?.rol === "ADMIN"}
                onEdit={() => handleEdit(article)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-text-muted">
              No se encontraron artículos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      )}

      {/* Summary Section */}
      <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
          <Download className="w-10 h-10 text-primary" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-2">
            Descargar Reglamento Completo
          </h3>
          <p className="text-text-muted">
            Obtén la versión PDF 2024 con todos los detalles técnicos,
            administrativos y disciplinarios del torneo.
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg shadow-primary/20 whitespace-nowrap"
        >
          Descargar PDF (2.4 MB)
        </Button>
      </div>

      {/* Admin Form Modal */}
      <RegulationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        article={selectedArticle}
      />
    </div>
  );
};

export default RegulationPage;
