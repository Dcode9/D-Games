import { TypeSafeClient, score } from "@typesafe-ai/sdk";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end(); // Method Not Allowed
    }

    const { concept } = req.body;
    if (!concept) {
        return res.status(400).json({ error: "No concept provided" });
    }

    // The environment variable TYPESAFE_API_KEY must be set in Vercel
    if (!"apikey_22232130601a0ad9469097aa0d16ad2d40e1_6f6539ac69ff4317b61e86de3e3aeeb80724001379f226236467484c67a11ce1") {
        return res.status(500).json({ error: "Missing TYPESAFE_API_KEY" });
    }

    const client = new TypeSafeClient({ apiKey: "apikey_22232130601a0ad9469097aa0d16ad2d40e1_6f6539ac69ff4317b61e86de3e3aeeb80724001379f226236467484c67a11ce1" });

    try {
        const response = await client.systemOne({
            state: {
                concept_to_evaluate: concept
            },
            questions: {
                ethereal: score("On a scale from purely physical to purely ethereal/magical, where does this concept fall?", [
                    "Purely physical (rocks, metal, mundane objects)",
                    "Mostly physical with some abstraction (a machine, biology, complex physical systems)",
                    "Highly abstract or magical, but grounded (energy, thoughts, basic spells)",
                    "Purely ethereal, magical, or conceptual (souls, gods, abstract math, pure light)"
                ]),
                chaos: score("On a scale from pure order to pure chaos, where does this concept fall?", [
                    "Pure order (crystals, mathematics, laws, clockwork)",
                    "Mostly ordered (civilization, structured systems, calm weather)",
                    "Mostly chaotic (wild nature, storms, raw emotions, riots)",
                    "Pure chaos (explosions, madness, total entropy, destruction)"
                ]),
                creation: score("On a scale from pure destruction to pure creation, where does this concept fall?", [
                    "Pure destruction (annihilation, rot, death, breaking)",
                    "Mostly destructive (decay, fire, consuming, dissolving)",
                    "Mostly creative (healing, building, growing, assembling)",
                    "Pure creation (giving life, synthesizing, divine genesis, birthing)"
                ])
            }
        });

        res.status(200).json({
            ethereal: response.answers.ethereal.score,
            chaos: response.answers.chaos.score,
            creation: response.answers.creation.score
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
