import { TypeSafeClient, score } from "@typesafe-ai/sdk";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { label } = req.body;
    if (!label) return res.status(400).json({ error: "No label provided" });

    // Ensure TYPESAFE_API_KEY is available (using the one the user provided or env var)
    const apiKey = process.env.TYPESAFE_API_KEY || "apikey_22232130601a0ad9469097aa0d16ad2d40e1_6f6539ac69ff4317b61e86de3e3aeeb80724001379f226236467484c67a11ce1";
    const client = new TypeSafeClient({ apiKey });

    try {
        const response = await client.systemOne({
            state: {
                object_description: label
            },
            questions: {
                mass: score("Based on the description, what is the relative mass/weight of this object?", [
                    "Weightless or extremely light (air, feathers, photons)",
                    "Light (wood, plastic, a normal box)",
                    "Heavy (solid iron, boulder, dense materials)",
                    "Astronomically heavy (a dying star, a black hole, an entire planet)"
                ]),
                bounciness: score("How elastic or bouncy is this object?", [
                    "Completely inelastic (lead, wet clay, rock)",
                    "Slightly elastic (wood, normal plastic)",
                    "Very bouncy (rubber, a tennis ball)",
                    "Hyper bouncy (flubber, a perfect spring, magic trampoline)"
                ]),
                friction: score("How much friction does the surface of this object have?", [
                    "Zero friction (wet ice, oiled teflon, magical slip)",
                    "Low friction (polished wood, smooth metal)",
                    "Normal friction (cardboard, dry wood, rough stone)",
                    "Maximum friction (sandpaper, superglue, velcro)"
                ])
            }
        });

        res.status(200).json({
            mass: response.answers.mass.score,
            bounciness: response.answers.bounciness.score,
            friction: response.answers.friction.score
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
}
