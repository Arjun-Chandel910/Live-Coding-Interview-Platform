import React, { useEffect, useState } from "react";
import { useProblem } from "../context/ProblemProvider";
import { Box, Typography, Chip, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ProblemSet() {
  const { getProblems } = useProblem();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const questions = await getProblems();
      setProblems(questions);
    };
    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ bgcolor: "#1e1e1e", minHeight: "100vh", p: 4 }}>
      <Typography variant="h6" sx={{ color: "#ccc", mb: 3 }}>
        {problems.length} Problems
      </Typography>

      <Box display="flex" flexDirection="column" gap={1.5}>
        {problems.map((p, idx) => (
          <Paper
            key={idx}
            elevation={3}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#2a2a2a",
              px: 3,
              py: 2,
              "&:hover": { bgcolor: "#333" },
              borderRadius: 2,
              cursor: "pointer",
            }}
            onClick={() =>
              navigate(`/problemset/${p._id}`, { state: { id: p._id } })
            }
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Typography
                variant="body2"
                sx={{ width: 30, color: "#bbb", textAlign: "right" }}
              >
                {idx + 1}.
              </Typography>

              {p.solved && (
                <span className="text-green-400 text-lg font-bold">✓</span>
              )}

              <Typography
                variant="body1"
                sx={{ color: "#fff", fontWeight: 500 }}
              >
                {p.title}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={3}>
              <Typography variant="body2" sx={{ color: "#aaa" }}>
                {p.acceptance ? `${p.acceptance}%` : "–––"}
              </Typography>

              <Chip
                label={p.difficulty === "Medium" ? "Med." : p.difficulty}
                color={getDifficultyColor(p.difficulty)}
                size="small"
                variant="filled"
              />

              <Box display="flex" gap="2px">
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: "2px",
                        height: "16px",
                        bgcolor: "#444",
                        borderRadius: "1px",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default ProblemSet;
